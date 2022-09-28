import { useState, useEffect } from "react";

function useResizerObserver(elementId: string) {
  const [dimensions, setDimensions] = useState({
      height: 0,
      width: 0
  });

  useEffect(() => {
    function onLoaded() {
      if(document.readyState !== "complete") return;
      const stage = document.getElementById(elementId);
      if(stage === null) return;
      setDimensions({width: stage.clientWidth, height: stage.clientHeight});
    }

    document.addEventListener('readystatechange', onLoaded);
    return (() => document.removeEventListener('readystatechange', onLoaded));
  });

  return dimensions;
}

export enum KeyState {
  DOWN,
  UP
}

interface Keys {
  [key: string]: KeyState
}

// TODO: use setKeys when the time arise
function useKeys() {
  const initialKeys: Keys = {};
  const [keys] = useState(initialKeys);

  function onKeyDown(e: KeyboardEvent) {
    keys[e.key] = KeyState.DOWN;
  }

  function onKeyUp(e: KeyboardEvent) {
    keys[e.key] = KeyState.UP;
  }

  useEffect(() => {
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('keydown', onKeyDown);

    return (() => {
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('keydown', onKeyDown);
    });
  });

  return keys;
}

function isNullOrUndefined(obj: any) {
  return obj === null || obj === undefined;
}

function isNull(obj: any) {
  return obj === null;
}

function isUndefined(obj: any) {
  return obj === undefined;
}

function clamp(x: number, min: number, max: number) {
  return Math.min(Math.max(x, min), max);
}

export { useResizerObserver, useKeys, isNullOrUndefined, isNull, isUndefined, clamp };

