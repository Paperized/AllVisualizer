import React, { useEffect } from 'react';
import { KonvaEventObject } from 'konva/lib/Node';
import { Stage, Layer, Circle, Text, Group, Rect, Line } from 'react-konva';
import { clamp, KeyState, useKeys, useResizerObserver } from '../../utils/utils';
import { Tree, Node, NodeVisual, elaborateTree, addTreeLevel } from '../../utils/tree-utils';
import OptionModal from '../modals/OptionModals';

function getExampleTree() : Tree {
  const root : Node = { key: 0, value: 0, visual: new NodeVisual()};
  root.left = { key: 1, value: -2, parent: root, visual: new NodeVisual()};
  root.right = { key: 2, value: 5, parent: root, visual: new NodeVisual()};
  root.left.left = { key: 3, value: -1, parent: root.left, visual: new NodeVisual()};
  root.left.right = { key: 4, value: -10, parent: root.left, visual: new NodeVisual()};
  root.right.left = { key: 5, value: 5, parent: root.right, visual: new NodeVisual()};
  root.right.right = { key: 6, value: 8, parent: root.right, visual: new NodeVisual()};
  root.left.right.left = { key: 7, value: -8, parent: root.left.right, visual: new NodeVisual()};
  return [[root], [root.left, root.right], [root.left.left, root.left.right, root.right.left, root.right.right], [undefined, undefined, root.left.right.left]];
}

const exampleOption = [
  {id: 1, value: "Add Left Node" },
  {id: 2, value: "Add Right Node" },
  {id: 3, value: "Remove Node" },
  {id: 4, value: "Close" }
];

function TreeCanvas() {
  const nodeSize = 20;
  const nodeSpace = 80;
  const exampleTree = getExampleTree();
  const elaboratedTree = elaborateTree(exampleTree, nodeSize, nodeSpace);

  const dimensions = useResizerObserver("tree-stage");
  const [tree, setTree] = React.useState(exampleTree);
  const [zoom, setZoom] = React.useState(1);

  const [modalType, setModalType] = React.useState("confirmation");
  const [isModalOpen, setModalOpen] = React.useState(false);
  const [modalPosition, setModalPosition] = React.useState({x: 0, y: 0});

  let currNodeSelected: Node | undefined = undefined;
  const keys = useKeys();

  function onOptionClick(id: number) {
    setModalOpen(false);

    if(modalType === "confirmation") {
      if(currNodeSelected === undefined) return;
      if(currNodeSelected.index === undefined || currNodeSelected.level === undefined) return;
      const leftChild = currNodeSelected.index * 2;
      switch(id) {
        case 1:
          if(tree.length < currNodeSelected.level + 1)
            addTreeLevel(tree);

          
          break;
        case 2:
          break;
        case 3:
          break;
        case 4:
          break;
      }
    }
  }

  function onWheelEvent(e: KonvaEventObject<WheelEvent>) {
    if(keys["Shift"] === KeyState.DOWN)
      setZoom(clamp(e.evt.deltaY > 0 ? zoom - 0.05 : zoom + 0.05, 0.5, 1.5));
  }

  function createChildEdges(node: Node | undefined) : JSX.Element | undefined {
    if(node === undefined) return undefined;
    const currPos = node.visual.position;
    const leftVisual = node.left?.visual;
    const rightVisual = node.right?.visual;
    
    return (
      <Group key={node.key}>
        { leftVisual !== undefined && <Line stroke="white" points={[currPos.x, currPos.y, leftVisual.position.x, leftVisual.position.y]} /> }
        { rightVisual !== undefined && <Line stroke="white" points={[currPos.x, currPos.y, rightVisual.position.x, rightVisual.position.y]} /> }
      </Group>);
  }

  function createNode(node: Node | undefined) : JSX.Element | undefined {
    if(node === undefined) return;
    const dragNode = node;
    function onDrag(evt: KonvaEventObject<DragEvent>) {
      dragNode.visual.position = evt.target.position();
      setTree([...tree]);
    }

    function onRightClick(evt: KonvaEventObject<PointerEvent>) {
      evt.evt.preventDefault();
      setModalOpen(true);
      setModalPosition({x: evt.evt.pageX, y: evt.evt.pageY});
      currNodeSelected = node;
    }

    return (
      <Group onContextMenu={onRightClick} key={node.key} draggable={true} x={node.visual.position.x} y={node.visual.position.y} onDragMove={onDrag}>
        <Circle radius={node.visual.radius} stroke="white" fill='black'/>
        <Text text={node.value?.toString()} fontSize={12} stroke="red" offset={{x: node.visual.radius, y: node.visual.radius}}
          align='center' verticalAlign='middle' width={node.visual.radius * 2} height={node.visual.radius * 2} />
      </Group>);
  }

  return (
    <div id="tree-stage" className='flex-grow-1'>
      <OptionModal isOpen={modalType === "confirmation" && isModalOpen} onOptionClick={onOptionClick} position={modalPosition} options={exampleOption}></OptionModal>
      <Stage height={dimensions.height} width={dimensions.width}>
        <Layer>
          <Group onWheel={onWheelEvent}>
            <Rect height={dimensions.height} width={dimensions.width} stroke="gray"/>
            <Group scale={{x: zoom, y:zoom}} draggable={true} x={dimensions.width / 2} y={dimensions.height / 2}
              offset={{x: elaboratedTree.maxWidth / 2, y: elaboratedTree.height / 2}}>
              <Rect width={elaboratedTree.maxWidth} height={elaboratedTree.height} />
              {
                tree.map((levelArray) => levelArray.map((node) => {
                  return createChildEdges(node)
                }))
              }
              {
                tree.map((levelArray) => levelArray.map((node) => {
                  return createNode(node)
                }))
              }
            </Group>
          </Group>
        </Layer>
      </Stage>
    </div>
  );
}

export default TreeCanvas;