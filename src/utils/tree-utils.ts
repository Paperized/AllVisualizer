import { Vector2d } from "konva/lib/types";

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
}

function addTreeNode(tree: Tree,  level: number, index: number, defaultRadius: number, defaultNodeSpace: number) {
  const levelArray = tree.at(level);
  if(levelArray === undefined) return;

  const space = getSpacePerNode(tree, level, defaultNodeSpace);
  const offset = getOffsetNode(tree, level, defaultNodeSpace);
/*
  const node: Node = {key: 10, visual: new NodeVisual()};
  node.visual.radius = defaultRadius;
  const currPos = {x: i * space + offset, y: levelIndex * defaultRadius * 3 + defaultRadius};
  node.visual.position = currPos;
  node.level = levelIndex;
  node.index = i;
  levelArray[index] = {key: 1, }*/
}

export { treeWidth, getSpacePerNode, getOffsetNode, elaborateTree, addTreeLevel };