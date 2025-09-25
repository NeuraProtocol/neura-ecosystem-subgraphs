import {
  Initialized as InitializedEvent,
  LSTRatioApplied as LSTRatioAppliedEvent,
  PriceDeviationThresholdSet as PriceDeviationThresholdSetEvent,
  Upgraded as UpgradedEvent,
  WrapperTokenMint as WrapperTokenMintEvent,
  WrapperTokenUnmint as WrapperTokenUnmintEvent
} from "../generated/WrapperTokenOperations/WrapperTokenOperations"
import {
  Initialized,
  LSTRatioApplied,
  PriceDeviationThresholdSet,
  Upgraded,
  WrapperTokenMint,
  WrapperTokenUnmint
} from "../generated/schema"

export function handleInitialized(event: InitializedEvent): void {
  let entity = new Initialized(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.version = event.params.version

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleLSTRatioApplied(event: LSTRatioAppliedEvent): void {
  let entity = new LSTRatioApplied(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.yieldAsset = event.params.yieldAsset
  entity.lstRatio = event.params.lstRatio
  entity.adjustedUSD = event.params.adjustedUSD

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePriceDeviationThresholdSet(
  event: PriceDeviationThresholdSetEvent
): void {
  let entity = new PriceDeviationThresholdSet(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.yieldAsset = event.params.yieldAsset
  entity.threshold = event.params.threshold

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleUpgraded(event: UpgradedEvent): void {
  let entity = new Upgraded(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.implementation = event.params.implementation

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleWrapperTokenMint(event: WrapperTokenMintEvent): void {
  let entity = new WrapperTokenMint(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.sender = event.params.sender
  entity.yieldAsset = event.params.yieldAsset
  entity.yieldAssetAmount = event.params.yieldAssetAmount
  entity.wrapperTokenAmount = event.params.wrapperTokenAmount
  entity.isUnderlyingAsset = event.params.isUnderlyingAsset
  entity.yieldAssetUSD = event.params.yieldAssetUSD
  entity.wrapperTokenUSD = event.params.wrapperTokenUSD

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleWrapperTokenUnmint(event: WrapperTokenUnmintEvent): void {
  let entity = new WrapperTokenUnmint(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.sender = event.params.sender
  entity.yieldAsset = event.params.yieldAsset
  entity.wrapperTokenAmount = event.params.wrapperTokenAmount
  entity.unmintAssetAmount = event.params.unmintAssetAmount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
