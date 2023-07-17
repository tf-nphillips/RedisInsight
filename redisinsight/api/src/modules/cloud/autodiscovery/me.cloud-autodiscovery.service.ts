import {
  Injectable,
} from '@nestjs/common';
import {
  DiscoverCloudDatabasesDto,
  ImportCloudDatabaseDto,
  ImportCloudDatabaseResponse,
} from 'src/modules/cloud/autodiscovery/dto';
import { CloudAutodiscoveryAuthType } from 'src/modules/cloud/autodiscovery/models';
import { SessionMetadata } from 'src/common/models';
import { CloudCapiAuthDto } from 'src/modules/cloud/common/dto';
import { wrapHttpError } from 'src/common/utils';
import { CloudAccountInfo } from 'src/modules/cloud/user/models';
import { CloudSubscription } from 'src/modules/cloud/subscription/models';
import { CloudDatabase } from 'src/modules/cloud/database/models';
import { CloudAutodiscoveryService } from 'src/modules/cloud/autodiscovery/cloud-autodiscovery.service';
import { CloudUserApiService } from 'src/modules/cloud/user/cloud-user.api.service';
import { CloudRequestUtm } from 'src/modules/cloud/common/models';

@Injectable()
export class MeCloudAutodiscoveryService {
  constructor(
    private readonly cloudAutodiscoveryService: CloudAutodiscoveryService,
    private readonly cloudUserApiService: CloudUserApiService,
  ) {}

  private async getCapiCredentials(sessionMetadata: SessionMetadata, utm?: CloudRequestUtm): Promise<CloudCapiAuthDto> {
    return this.cloudUserApiService.getCapiKeys(sessionMetadata, utm);
  }

  /**
   * Get cloud account short info
   * @param sessionMetadata
   * @param utm
   */
  async getAccount(sessionMetadata: SessionMetadata, utm: CloudRequestUtm): Promise<CloudAccountInfo> {
    try {
      return await this.cloudAutodiscoveryService.getAccount(
        await this.getCapiCredentials(sessionMetadata, utm),
      );
    } catch (e) {
      // todo: error
      throw wrapHttpError(e);
    }
  }

  /**
   * Discover all subscriptions
   * @param sessionMetadata
   * @param utm
   */
  async discoverSubscriptions(sessionMetadata: SessionMetadata, utm?: CloudRequestUtm): Promise<CloudSubscription[]> {
    try {
      return await this.cloudAutodiscoveryService.discoverSubscriptions(
        await this.getCapiCredentials(sessionMetadata, utm),
        CloudAutodiscoveryAuthType.Sso,
      );
    } catch (e) {
      // todo: error
      throw wrapHttpError(e);
    }
  }

  /**
   * Get all databases from specified multiple subscriptions
   * @param sessionMetadata
   * @param dto
   * @param utm
   */
  async discoverDatabases(
    sessionMetadata: SessionMetadata,
    dto: DiscoverCloudDatabasesDto,
    utm?: CloudRequestUtm,
  ): Promise<CloudDatabase[]> {
    try {
      return await this.cloudAutodiscoveryService.discoverDatabases(
        await this.getCapiCredentials(sessionMetadata, utm),
        dto,
        CloudAutodiscoveryAuthType.Sso,
      );
    } catch (e) {
      // todo: error
      throw wrapHttpError(e);
    }
  }

  /**
   * Add database from cloud
   * @param sessionMetadata
   * @param addDatabasesDto
   * @param utm
   */
  async addRedisCloudDatabases(
    sessionMetadata: SessionMetadata,
    addDatabasesDto: ImportCloudDatabaseDto[],
    utm?: CloudRequestUtm,
  ): Promise<ImportCloudDatabaseResponse[]> {
    try {
      return await this.cloudAutodiscoveryService.addRedisCloudDatabases(
        await this.getCapiCredentials(sessionMetadata, utm),
        addDatabasesDto,
      );
    } catch (e) {
      // todo: error
      throw wrapHttpError(e);
    }
  }
}
