import {
  Approval as ApprovalEvent,
  ApprovalForAll as ApprovalForAllEvent,
  Collect as CollectEvent,
  DecreaseLiquidity as DecreaseLiquidityEvent,
  IncreaseLiquidity as IncreaseLiquidityEvent
} from "../generated/PositionManager/PositionManager";
import {
  Approval,
  ApprovalForAll,
  Collect,
  DecreaseLiquidity,
  IncreaseLiquidity
} from "../generated/schema";

export function handleApproval(event: ApprovalEvent): void {
  let entity = new Approval(event.transaction.hash.concatI32(event.logIndex.toI32()));
  entity.owner = event.params.owner;
  entity.approved = event.params.approved;
  entity.tokenId = event.params.tokenId;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleApprovalForAll(event: ApprovalForAllEvent): void {
  let entity = new ApprovalForAll(event.transaction.hash.concatI32(event.logIndex.toI32()));
  entity.owner = event.params.owner;
  entity.operator = event.params.operator;
  entity.approved = event.params.approved;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleCollect(event: CollectEvent): void {
  let entity = new Collect(event.transaction.hash.concatI32(event.logIndex.toI32()));
  entity.tokenId = event.params.tokenId;
  entity.recipient = event.params.recipient;
  entity.amount0 = event.params.amount0;
  entity.amount1 = event.params.amount1;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleIncreaseLiquidity(event: IncreaseLiquidityEvent): void {
  let entity = new IncreaseLiquidity(event.transaction.hash.concatI32(event.logIndex.toI32()));
  entity.tokenId = event.params.tokenId;
  entity.liquidityDesired = event.params.liquidityDesired;
  entity.actualLiquidity = event.params.actualLiquidity;
  entity.amount0 = event.params.amount0;
  entity.amount1 = event.params.amount1;
  entity.pool = event.params.pool;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleDecreaseLiquidity(event: DecreaseLiquidityEvent): void {
  let entity = new DecreaseLiquidity(event.transaction.hash.concatI32(event.logIndex.toI32()));
  entity.tokenId = event.params.tokenId;
  entity.liquidity = event.params.liquidity;
  entity.amount0 = event.params.amount0;
  entity.amount1 = event.params.amount1;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}
