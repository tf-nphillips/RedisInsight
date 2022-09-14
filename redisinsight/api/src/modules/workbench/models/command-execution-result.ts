import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CommandExecutionStatus } from 'src/modules/cli/dto/cli.dto';
import { EndpointDto } from 'src/modules/instances/dto/database-instance.dto';

class ClusterNode extends EndpointDto {
  @ApiPropertyOptional({
    description: 'Cluster node slot.',
    type: Number,
    example: 0,
  })
  slot?: number;
}

export class CommandExecutionResult {
  @ApiProperty({
    description: 'Redis CLI command execution status',
    default: CommandExecutionStatus.Success,
    enum: CommandExecutionStatus,
  })
  status: CommandExecutionStatus;

  @ApiProperty({
    type: String,
    description: 'Redis response',
  })
  response: any;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Result did not stored in db',
  })
  isNotStored?: boolean;

  @ApiPropertyOptional({
    type: () => ClusterNode,
    description: 'Redis Cluster Node info',
  })
  node?: ClusterNode;

  constructor(partial: Partial<CommandExecutionResult> = {}) {
    Object.assign(this, partial);
  }
}
