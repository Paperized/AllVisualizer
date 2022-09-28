import React from 'react';
import { KonvaEventObject } from 'konva/lib/Node';
import { Stage, Layer, Circle, Text, Group, Rect, Line } from 'react-konva';
import { clamp, KeyState, useKeys, useResizerObserver } from '../../utils/utils';
import { Tree, Node, NodeVisual, elaborateTree, addTreeNode, ElaboratedTree, removeTreeNode } from '../../utils/tree-utils';
import OptionModal, { ModalOpt } from '../modals/OptionModals';
import { Vector2d } from 'konva/lib/types';
import Konva from 'konva';
import LeftPanelTree from './LeftPanel';
import './TreeCanvas.scss';

const ADD_LEFT_NODE_OPT: ModalOpt = {id: 1, value: "Add Left Node" };
const ADD_RIGHT_NODE_OPT: ModalOpt = {id: 2, value: "Add Right Node" };
const REMOVE_NODE_OPT: ModalOpt = {id: 3, value: "Remove Node" };
const CLOSE_OPT: ModalOpt = {id: 4, value: "Close" };

function getExampleTree() : Tree {
  const root : Node = { key: 0, value: 0, visual: new NodeVisual()};
  root.left = { key: 1, value: -2, parent: root, visual: new NodeVisual()};
  root.right = { key: 2, value: 5, parent: root, visual: new NodeVisual()};
  root.left.left = { key: 3, value: -1, parent: root.left, visual: new NodeVisual()};
  root.left.right = { key: 4, value: -10, parent: root.left, visual: new NodeVisual()};
  root.right.left = { key: 5, value: 5, parent: root.right, visual: new NodeVisual()};
  root.right.right = { key: 6, value: 8, parent: root.right, visual: new NodeVisual()};
  return [[root], [root.left, root.right], [root.left.left, root.left.right, root.right.left, root.right.right]];
}

type SelectedNode = {node: Node, target: Konva.Node} | undefined;

function TreeCanvas() {
  const nodeSize = 20;
  const nodeSpace = 80;

  const stage = React.useRef<Konva.Stage>(null);

  const dimensions = useResizerObserver("main-content");
  const [tree, setTree] = React.useState(getExampleTree());
  const [elaboratedTree, setElaboratedTree] = React.useState<Tree>([]);
  const [treeSize, setTreeSize] = React.useState<ElaboratedTree>({height: 0, maxWidth: 0});
  
  const [zoom, setZoom] = React.useState(1);
  
  const [modalType, setModalType] = React.useState("option-menu");
  const [isModalOpen, setModalOpen] = React.useState(false);
  const [modalPosition, setModalPosition] = React.useState<Vector2d>({x: 0, y: 0});
  const [modalOptions, setModalOptions] = React.useState<ModalOpt[]>([]);
  
  const [selectedNode, setSelectedNode] = React.useState<SelectedNode>(undefined);
  const keys = useKeys();
  
  React.useEffect(() => {
    setTreeSize(elaborateTree(tree, nodeSize, nodeSpace));
    setElaboratedTree(tree);
  }, [tree]);

  React.useEffect(() => {
    hideTextArea();
    if(selectedNode === undefined) return;
    let mult = 0.03;
    const range = {min: 0.9, max: 1.1};
    const id = setInterval(() => {
      const shiftDown = keys['Shift'] === KeyState.DOWN;
      if(keys['Delete'] === KeyState.DOWN) {
        executeOperationOnSelected(REMOVE_NODE_OPT.id);
      } else if(shiftDown) {
        if(keys['A'] === KeyState.DOWN)
          executeOperationOnSelected(ADD_LEFT_NODE_OPT.id);
        else if(keys['D'] === KeyState.DOWN)
          executeOperationOnSelected(ADD_RIGHT_NODE_OPT.id);
      }

      if(keys['Enter'] === KeyState.DOWN) {
        showTextArea();
      }

      const currScale = selectedNode.target.scaleX();
      const nextScale = clamp(mult + currScale, range.min, range.max);
      if(nextScale === range.min || nextScale === range.max)
        mult *= -1;

      selectedNode.target.scale({x: nextScale, y: nextScale});

      if(shiftDown && stage.current !== null) {
        const leftNode = selectedNode.node.left;
        const rightNode = selectedNode.node.right;
        const parentNode = selectedNode.node.parent;
        if(keys['ArrowLeft'] === KeyState.DOWN && leftNode !== undefined) {
          const leftGroup = stage.current.findOne(`#NODE_${leftNode.level}_${leftNode.index}`);
          setSelectedNode({node: leftNode, target: leftGroup});
        } else if(keys['ArrowRight'] === KeyState.DOWN && rightNode !== undefined) {
          const rightGroup = stage.current.findOne(`#NODE_${rightNode.level}_${rightNode.index}`);
          setSelectedNode({node: rightNode, target: rightGroup});
        } else if(keys['ArrowUp'] === KeyState.DOWN && parentNode !== undefined) {
          const parentGroup = stage.current.findOne(`#NODE_${parentNode.level}_${parentNode.index}`);
          setSelectedNode({node: parentNode, target: parentGroup});
        }
      }
    }, 60);

    return (() => {
      selectedNode.target.scale({x: 1, y: 1});
      clearInterval(id);
    });
  }, [selectedNode]);

  function onOptionClick(id: number) {
    setModalOpen(false);

    if(modalType === "option-menu") {
      executeOperationOnSelected(id);
    }
  }

  function executeOperationOnSelected(id: number) { 
    if(selectedNode === undefined) return;
    if(selectedNode.node.index === undefined || selectedNode.node.level === undefined) return;
    switch(id) {
      case ADD_LEFT_NODE_OPT.id:
        if(selectedNode.node.left !== undefined) break;
        addTreeNode(tree, selectedNode.node.level + 1, selectedNode.node.index * 2);
        setTree([...tree]);
        break;
      case ADD_RIGHT_NODE_OPT.id:
        if(selectedNode.node.right !== undefined) break;
        addTreeNode(tree, selectedNode.node.level + 1, selectedNode.node.index * 2 + 1);
        setTree([...tree]);
        break;
      case REMOVE_NODE_OPT.id:
        const parent = selectedNode.node.parent;
        if(parent === undefined) break;
        removeTreeNode(tree, selectedNode.node.level, selectedNode.node.index);
        setTree([...tree]);
        if(stage.current === null) return;
        const parentGroup = stage.current.findOne(`#NODE_${parent.level}_${parent.index}`);
        setSelectedNode({node: parent, target: parentGroup});
        break;
      case CLOSE_OPT.id:
      default:
        break;
    }
  }

  function onWheelEvent(e: KonvaEventObject<WheelEvent>) {
    if(keys["Shift"] === KeyState.DOWN)
      setZoom(clamp(e.evt.deltaY > 0 ? zoom - 0.05 : zoom + 0.05, 0.5, 1.5));
  }

  function onClickEvent(e: KonvaEventObject<MouseEvent>) {
    setSelectedNode(undefined);
    setModalOpen(false);
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
      setElaboratedTree([...elaboratedTree]);
    }

    function onRightClick(evt: KonvaEventObject<PointerEvent>) {
      evt.evt.preventDefault();
      setModalOpen(true);
      setModalPosition({x: evt.evt.pageX, y: evt.evt.pageY});

      const modalOpts: ModalOpt[] = [];
      if(dragNode.left === undefined)
        modalOpts.push(ADD_LEFT_NODE_OPT);
      if(dragNode.right === undefined)
        modalOpts.push(ADD_RIGHT_NODE_OPT);
      if(dragNode.parent !== undefined)
        modalOpts.push(REMOVE_NODE_OPT);

      modalOpts.push(CLOSE_OPT);
      setSelectedNode({node: dragNode, target: evt.currentTarget});
      setModalOptions(modalOpts);
    }

    function onClick(evt: KonvaEventObject<MouseEvent>) {
      setSelectedNode({node: dragNode, target: evt.currentTarget});
      evt.cancelBubble = true;
    }

    function onDblClick(evt: KonvaEventObject<MouseEvent>) {
      showTextArea();
    }

    const id = `NODE_${dragNode.level}_${dragNode.index}`;

    return (
      <Group id={id} onContextMenu={onRightClick} onClick={onClick} key={node.key} draggable={true}
         x={node.visual.position.x} y={node.visual.position.y} onDragMove={onDrag}>
        <Circle radius={node.visual.radius} stroke="white" fill='black'/>
        <Text text={node.value?.toString()} onDblClick={onDblClick} fontSize={12} stroke="red" offset={{x: node.visual.radius, y: node.visual.radius}}
          align='center' verticalAlign='middle' width={node.visual.radius * 2} height={node.visual.radius * 2} />
      </Group>);
  }

  function showTextArea() {
    if(selectedNode === undefined) return;
    let textarea: any = document.getElementById("area-node-value");
    if(textarea === null) return;
    if(textarea.style.display === 'block') return;

    const groupNode = selectedNode.target as Konva.Group;
    const textNode = groupNode.getChildren(x => x instanceof Konva.Text)[0] as Konva.Text;
    textarea.value = textNode.text();
    textarea.style.position = 'absolute';
    const pos = textNode.absolutePosition();
    textarea.style.top = pos.y + 'px';
    textarea.style.left = pos.x + 'px';
    textarea.style.transform = 'translate(-50%, 100%)';
    textarea.style.width = textNode.width() + 'px';
    textarea.style.height = textNode.height() + 'px';
    textarea.style.display = 'block';

    textarea.focus();

    function onKeyDown(e: any) {
      if (e.code === "Enter") {
        e.stopPropagation();
        textarea.style.display = 'none';
        const value = +textarea.value;
        if(isNaN(value)) return;
        textNode.text(textarea.value);
        selectedNode!.node.value = value;
      } else if(e.code === "Escape") {
        e.stopPropagation();
        hideTextArea();
      }
    }

    textarea.addEventListener('keydown', onKeyDown);

    textarea.addEventListener('focusout', function focusout(e: any) {
      textarea.removeEventListener('keydown', onKeyDown);
      textarea.removeEventListener('focusout', focusout);
      textarea.style.display = 'none';
    });
  }

  function hideTextArea() {
    let textarea: any = document.getElementById("area-node-value");
    if(textarea === null) return;

    textarea.blur();
  }

  return (
    <React.Fragment>
      <textarea id="area-node-value" style={{display: 'none', zIndex: 1000}}></textarea>
      <LeftPanelTree height={dimensions.height}></LeftPanelTree>
      <OptionModal isOpen={modalType === "option-menu" && isModalOpen} onOptionClick={onOptionClick} position={modalPosition} options={modalOptions}></OptionModal>
      <Stage ref={stage} height={dimensions.height} width={dimensions.width}>
        <Layer>
          <Group id="#main" onWheel={onWheelEvent} onClick={onClickEvent}>
            <Rect height={dimensions.height} width={dimensions.width} stroke="gray"/>
            <Group scale={{x: zoom, y:zoom}} draggable={true} x={dimensions.width / 2} y={dimensions.height / 2}
              offset={{x: treeSize.maxWidth / 2, y: treeSize.height / 2}}>
              <Rect width={treeSize.maxWidth} height={treeSize.height} />
              {
                elaboratedTree.map((levelArray) => levelArray.map((node) => {
                  return createChildEdges(node)
                }))
              }
              {
                elaboratedTree.map((levelArray) => levelArray.map((node) => {
                  return createNode(node)
                }))
              }
            </Group>
          </Group>
        </Layer>
      </Stage>
    </React.Fragment>
  );
}

export default TreeCanvas;