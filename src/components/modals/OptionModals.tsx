import { Vector2d } from "konva/lib/types";
import React from "react";
import './Modals.scss';

export type ModalOpt = {id: number, value: string};

export interface OptionModalProps {
  isOpen: boolean;
  position: Vector2d;
  options: ModalOpt[]
  onOptionClick: (id: any) => void;
}

function OptionModal(props: OptionModalProps) {
  return (
    <div className="modal-content" style={{visibility: props.isOpen ? "visible" : "hidden", left: props.position.x, top: props.position.y}}>
      <div className="modal-header mt-2 justify-content-center">
        <h5 className="modal-title">Menu Option</h5>
      </div>
      <div className="d-flex flex-column modal-list">
        {
          props.options && props.options.map(item => {
            return <span id={item.id.toString()} key={item.id} onClick={() => { props.onOptionClick(item.id) }}>{item.value}</span>
          })
        }
      </div>
    </div>
  );
}

export default OptionModal;