import { toNumber } from 'lodash';
import * as isGlob from 'is-glob';
import config from 'src/utils/config';
import { unescapeGlob } from 'src/utils';
import {
  BrowserToolClusterService,
} from 'src/modules/browser/services/browser-tool-cluster/browser-tool-cluster.service';
import { IFindRedisClientInstanceByOptions } from 'src/modules/core/services/redis/redis.service';
import { BrowserToolKeysCommands } from 'src/modules/browser/constants/browser-tool-commands';
import {
  GetKeyInfoResponse,
  GetKeysWithDetailsResponse,
  RedisDataType,
} from 'src/modules/browser/dto';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { ISettingsProvider } from 'src/modules/core/models/settings-provider.interface';
import { AbstractStrategy } from './abstract.strategy';
import { IGetNodeKeysResult } from '../scanner.interface';

const NODES_SEPARATOR = '||';
const CURSOR_SEPARATOR = '@';
// Correct format 172.17.0.1:7001@-1||172.17.0.1:7002@33
const CLUSTER_CURSOR_REGEX = /^(([a-z0-9.])+:[0-9]+(@-?\d+))+((\|\|)?([a-z0-9.])+:[0-9]+(@-?\d+))*$/;
const REDIS_SCAN_CONFIG = config.get('redis_scan');

export class ClusterStrategy extends AbstractStrategy {
  private readonly redisManager: BrowserToolClusterService;

  private settingsProvider: ISettingsProvider;

  constructor(
    redisManager: BrowserToolClusterService,
    settingsProvider: ISettingsProvider,
  ) {
    super(redisManager);
    this.redisManager = redisManager;
    this.settingsProvider = settingsProvider;
  }

  public async getKeys(
    clientOptions,
    args,
  ): Promise<GetKeysWithDetailsResponse[]> {
    const match = args.match !== undefined ? args.match : '*';
    const count = args.count || REDIS_SCAN_CONFIG.countDefault;
    const nodes = await this.getNodesToScan(clientOptions, args.cursor);
    const settings = await this.settingsProvider.getSettings();
    await this.calculateNodesTotalKeys(clientOptions, nodes);

    if (!isGlob(match, { strict: false })) {
      const keyName = unescapeGlob(match);
      nodes.forEach((node) => {
        // eslint-disable-next-line no-param-reassign
        node.cursor = 0;
        // eslint-disable-next-line no-param-reassign
        node.scanned = node.total;
      });
      nodes[0].keys = await this.getKeysInfo(clientOptions, [keyName]);
      nodes[0].keys = nodes[0].keys.filter((key: GetKeyInfoResponse) => {
        if (key.ttl === -2) {
          return false;
        }
        if (args.type) {
          return key.type === args.type;
        }
        return true;
      });
      return nodes;
    }

    let allNodesScanned = false;
    while (
      !allNodesScanned
      && nodes.reduce((prev, cur) => prev + cur.keys.length, 0) < count
      && nodes.reduce((prev, cur) => prev + cur.scanned, 0)
        < settings.scanThreshold
    ) {
      await this.scanNodes(clientOptions, nodes, match, count, args.type);
      allNodesScanned = !nodes.some((node) => node.cursor !== 0);
    }

    await Promise.all(
      nodes.map(async (node) => {
        if (node.keys.length) {
          // eslint-disable-next-line no-param-reassign
          node.keys = await this.getKeysInfo(
            clientOptions,
            node.keys,
            args.type,
          );
        }
      }),
    );

    return nodes;
  }

  private async getNodesToScan(
    clientOptions: IFindRedisClientInstanceByOptions,
    initialCursor: string,
  ): Promise<IGetNodeKeysResult[]> {
    if (Number.isNaN(toNumber(initialCursor))) {
      return this.getNodesFromClusterCursor(initialCursor);
    }

    const clusterNodes = await this.redisManager.getNodes(
      clientOptions,
      'master',
    );

    return clusterNodes.map(({ options: { host, port } }) => ({
      host,
      port,
      cursor: 0,
      keys: [],
      total: 0,
      scanned: 0,
    }));
  }

  /**
   * Parses composed custom cursor from FE and returns nodes
   * Format: 172.17.0.1:7001@22||172.17.0.1:7002@33
   */
  private getNodesFromClusterCursor(cursor: string): IGetNodeKeysResult[] {
    const isCorrectFormat = CLUSTER_CURSOR_REGEX.test(cursor);
    if (!isCorrectFormat) {
      throw new Error(ERROR_MESSAGES.INCORRECT_CLUSTER_CURSOR_FORMAT);
    }
    const nodeStrings = cursor.split(NODES_SEPARATOR);
    const nodes = [];

    nodeStrings.forEach((item: string) => {
      const [address, nextCursor] = item.split(CURSOR_SEPARATOR);
      const [host, port] = address.split(':');
      if (parseInt(nextCursor, 10) >= 0) {
        nodes.push({
          total: 0,
          scanned: 0,
          host,
          port: parseInt(port, 10),
          cursor: parseInt(nextCursor, 10),
          keys: [],
        });
      }
    });
    return nodes;
  }

  private async calculateNodesTotalKeys(
    clientOptions,
    nodes: IGetNodeKeysResult[],
  ): Promise<void> {
    await Promise.all(
      nodes.map(async (node) => {
        const result = await this.redisManager.execCommandFromNode(
          clientOptions,
          BrowserToolKeysCommands.DbSize,
          [],
          { host: node.host, port: node.port },
        );
        // eslint-disable-next-line no-param-reassign
        node.total = result.result;
      }),
    );
  }

  /**
   * Scan keys for each node and mutates input data
   */
  private async scanNodes(
    clientOptions,
    nodes: IGetNodeKeysResult[],
    match: string,
    count: number,
    type?: RedisDataType,
  ): Promise<void> {
    await Promise.all(
      nodes.map(async (node) => {
        // ignore full scanned nodes or nodes with no items
        if ((node.cursor === 0 && node.scanned !== 0) || node.total === 0) {
          return;
        }

        const commandArgs = [`${node.cursor}`, 'MATCH', match, 'COUNT', count];
        if (type) {
          commandArgs.push('TYPE', type);
        }

        const {
          result,
        } = await this.redisManager.execCommandFromNode(
          clientOptions,
          BrowserToolKeysCommands.Scan,
          commandArgs,
          { host: node.host, port: node.port },
        );

        // eslint-disable-next-line no-param-reassign
        node.cursor = parseInt(result[0], 10);
        node.keys.push(...result[1]);
        // eslint-disable-next-line no-param-reassign
        node.scanned += count;
      }),
    );
  }
}