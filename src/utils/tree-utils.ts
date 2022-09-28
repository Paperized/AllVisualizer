import Konva from "konva";
import { Group } from "konva/lib/Group";
import { NodeConfig } from "konva/lib/Node";
import { Vector2d } from "konva/lib/types";
import React, { LegacyRef } from "react";

export class NodeVisual {
  position: Vector2d = {x: 0, y: 0};
  radius: number = 0;
}

export class Node {
  key: number = -1;
  value?: number;
  parent?: Node;
  left?: Node;
  right?: Node;

  level?: number;
  index?: number;
  visual: NodeVisual = new NodeVisual();
}

export interface ElaboratedTree {
  maxWidth: number;
  height: number;
}

export type Tree = (Node | undefined) [][];


function treeWidth(tree: Tree, defaultNodeSpace: number) : number {
  return Math.pow(2, tree.length - 1) * defaultNodeSpace;
}

function treeHeight(tree: Tree, defaultNodeSize: number) : number {
  return (tree.length - 1) * defaultNodeSize * 3 + defaultNodeSize * 2;
}

function getSpacePerNode(tree: Tree, levelIndex: number, defaultNodeSpace: number) : number {
  return treeWidth(tree, defaultNodeSpace) / Math.pow(2, levelIndex);
}

function getOffsetNode(tree: Tree, levelIndex: number, defaultNodeSpace: number) : number {
  return getSpacePerNode(tree, levelIndex, defaultNodeSpace) / 2;
}

function elaborateTree(tree: Tree, defaultRadius: number, defaultNodeSpace: number) : ElaboratedTree {
  tree.forEach((levelArray, levelIndex) => {
    const space = getSpacePerNode(tree, levelIndex, defaultNodeSpace);
    const offset = getOffsetNode(tree, levelIndex, defaultNodeSpace);

    levelArray.forEach((node, i) => {
      if(node === undefined) return;
      node.visual.radius = defaultRadius;
      const currPos = {x: i * space + offset, y: levelIndex * defaultRadius * 3 + defaultRadius};
      node.visual.position = currPos;
      node.level = levelIndex;
      node.index = i;
    })
  });

  return {maxWidth: treeWidth(tree, defaultNodeSpace), height: treeHeight(tree, defaultRadius)};
}

function addTreeLevel(tree: Tree) {
  const newNodes = Math.pow(2, tree.length);
  const level = [];
  for(let i = 0; i < newNodes; i++)
    level.push(undefined);

  tree.push(level);
  return level;
}

function addTreeNode(tree: Tree, level: number, index: number) {
  if(index >= Math.pow(2, level)) return;
  const parentIndex = index / 2;
  const parentIndexFloor = Math.floor(index / 2);
  const parent = tree.at(level - 1)?.at(parentIndexFloor);
  if(parent === undefined) return;

  let levelArray = tree.at(level) ?? addTreeLevel(tree);

  const node: Node = {key: Math.random() * 20000, parent: parent, visual: new NodeVisual()};
  node.level = level;
  node.value = 0;
  node.index = index;
  levelArray[index] = node;

  if(parent !== undefined) {
    if(parentIndex === parentIndexFloor) {
      parent.left = node;
    } else {
      parent.right = node;
    }
  }
}

function removeTreeNode(tree: Tree, level: number, index: number) {
  if(level === 0 || level >= tree.length) return;
  if(index >= Math.pow(2, level)) return;

  const levelArray = tree.at(level)!;
  const curr = levelArray?.at(index);
  if(curr === undefined) return;
  
  removeTreeNode(tree, level + 1, index * 2);
  removeTreeNode(tree, level + 1, index * 2 + 1);

  levelArray[index] = undefined;
  if(curr.parent?.left === curr) {
    curr.parent!.left = undefined;
  } else if(curr.parent?.right === curr) {
    curr.parent!.right = undefined;
  }

  if(levelArray.every(value => value === undefined))
    tree.splice(level, 1);
}

export { treeWidth, getSpacePerNode, getOffsetNode, elaborateTree, addTreeLevel, addTreeNode, removeTreeNode };