import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import {
  Initialized,
  LSTRatioApplied,
  PriceDeviationThresholdSet,
  Upgraded,
  WrapperTokenMint,
  WrapperTokenUnmint
} from "../generated/WrapperTokenOperations/WrapperTokenOperations"

export function createInitializedEvent(version: BigInt): Initialized {
  let initializedEvent = changetype<Initialized>(newMockEvent())

  initializedEvent.parameters = new Array()

  initializedEvent.parameters.push(
    new ethereum.EventParam(
      "version",
      ethereum.Value.fromUnsignedBigInt(version)
    )
  )

  return initializedEvent
}

export function createLSTRatioAppliedEvent(
  yieldAsset: Address,
  lstRatio: BigInt,
  adjustedUSD: BigInt
): LSTRatioApplied {
  let lstRatioAppliedEvent = changetype<LSTRatioApplied>(newMockEvent())

  lstRatioAppliedEvent.parameters = new Array()

  lstRatioAppliedEvent.parameters.push(
    new ethereum.EventParam(
      "yieldAsset",
      ethereum.Value.fromAddress(yieldAsset)
    )
  )
  lstRatioAppliedEvent.parameters.push(
    new ethereum.EventParam(
      "lstRatio",
      ethereum.Value.fromUnsignedBigInt(lstRatio)
    )
  )
  lstRatioAppliedEvent.parameters.push(
    new ethereum.EventParam(
      "adjustedUSD",
      ethereum.Value.fromUnsignedBigInt(adjustedUSD)
    )
  )

  return lstRatioAppliedEvent
}

export function createPriceDeviationThresholdSetEvent(
  yieldAsset: Address,
  threshold: BigInt
): PriceDeviationThresholdSet {
  let priceDeviationThresholdSetEvent =
    changetype<PriceDeviationThresholdSet>(newMockEvent())

  priceDeviationThresholdSetEvent.parameters = new Array()

  priceDeviationThresholdSetEvent.parameters.push(
    new ethereum.EventParam(
      "yieldAsset",
      ethereum.Value.fromAddress(yieldAsset)
    )
  )
  priceDeviationThresholdSetEvent.parameters.push(
    new ethereum.EventParam(
      "threshold",
      ethereum.Value.fromUnsignedBigInt(threshold)
    )
  )

  return priceDeviationThresholdSetEvent
}

export function createUpgradedEvent(implementation: Address): Upgraded {
  let upgradedEvent = changetype<Upgraded>(newMockEvent())

  upgradedEvent.parameters = new Array()

  upgradedEvent.parameters.push(
    new ethereum.EventParam(
      "implementation",
      ethereum.Value.fromAddress(implementation)
    )
  )

  return upgradedEvent
}

export function createWrapperTokenMintEvent(
  sender: Address,
  yieldAsset: Address,
  yieldAssetAmount: BigInt,
  wrapperTokenAmount: BigInt,
  isUnderlyingAsset: boolean,
  yieldAssetUSD: BigInt,
  wrapperTokenUSD: BigInt
): WrapperTokenMint {
  let wrapperTokenMintEvent = changetype<WrapperTokenMint>(newMockEvent())

  wrapperTokenMintEvent.parameters = new Array()

  wrapperTokenMintEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )
  wrapperTokenMintEvent.parameters.push(
    new ethereum.EventParam(
      "yieldAsset",
      ethereum.Value.fromAddress(yieldAsset)
    )
  )
  wrapperTokenMintEvent.parameters.push(
    new ethereum.EventParam(
      "yieldAssetAmount",
      ethereum.Value.fromUnsignedBigInt(yieldAssetAmount)
    )
  )
  wrapperTokenMintEvent.parameters.push(
    new ethereum.EventParam(
      "wrapperTokenAmount",
      ethereum.Value.fromUnsignedBigInt(wrapperTokenAmount)
    )
  )
  wrapperTokenMintEvent.parameters.push(
    new ethereum.EventParam(
      "isUnderlyingAsset",
      ethereum.Value.fromBoolean(isUnderlyingAsset)
    )
  )
  wrapperTokenMintEvent.parameters.push(
    new ethereum.EventParam(
      "yieldAssetUSD",
      ethereum.Value.fromUnsignedBigInt(yieldAssetUSD)
    )
  )
  wrapperTokenMintEvent.parameters.push(
    new ethereum.EventParam(
      "wrapperTokenUSD",
      ethereum.Value.fromUnsignedBigInt(wrapperTokenUSD)
    )
  )

  return wrapperTokenMintEvent
}

export function createWrapperTokenUnmintEvent(
  sender: Address,
  yieldAsset: Address,
  wrapperTokenAmount: BigInt,
  unmintAssetAmount: BigInt
): WrapperTokenUnmint {
  let wrapperTokenUnmintEvent = changetype<WrapperTokenUnmint>(newMockEvent())

  wrapperTokenUnmintEvent.parameters = new Array()

  wrapperTokenUnmintEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )
  wrapperTokenUnmintEvent.parameters.push(
    new ethereum.EventParam(
      "yieldAsset",
      ethereum.Value.fromAddress(yieldAsset)
    )
  )
  wrapperTokenUnmintEvent.parameters.push(
    new ethereum.EventParam(
      "wrapperTokenAmount",
      ethereum.Value.fromUnsignedBigInt(wrapperTokenAmount)
    )
  )
  wrapperTokenUnmintEvent.parameters.push(
    new ethereum.EventParam(
      "unmintAssetAmount",
      ethereum.Value.fromUnsignedBigInt(unmintAssetAmount)
    )
  )

  return wrapperTokenUnmintEvent
}
