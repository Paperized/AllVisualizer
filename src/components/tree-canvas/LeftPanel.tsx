import React from 'react';
import "./LeftPanel.scss";

interface LeftPanelProps {
  height: number;
};

function LeftPanelTree(props: LeftPanelProps) {
  return (
    <div className='left-panel' style={{maxHeight: props.height}}>
      <div>
        <span>Shift + A -&gt; Add left child</span><br/>
        <span>Shift + D -&gt; Add to right child</span><br/>
        <span>Delete -&gt; Remove current node</span><br/>
        <span>Shift + Left Arrow -&gt; Move to left child</span><br/>
        <span>Shift + Right Arrow -&gt; Move to right child</span><br/>
        <span>Shift + Up Arrow -&gt; Move to parent</span><br/>
        <span>Enter OR Double Click -&gt; Change node value</span><br/>
        <span>Escape -&gt; Quit node value textarea</span>
      </div>
    </div>
  );
}

export default LeftPanelTree;