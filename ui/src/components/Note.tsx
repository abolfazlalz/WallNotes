import React from "react";
import Draggable, { DraggableData } from "react-draggable";
import { ColorResult, TwitterPicker } from 'react-color'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faPalette } from '@fortawesome/free-solid-svg-icons'
import { NoteType } from "../types/NoteType";
import { Button, ButtonGroup, Overlay, Tooltip } from "react-bootstrap";

type State = {
    showColor: boolean
    showTrash: boolean
    note: NoteType
    isMove: boolean
}

type Props = {
    note: NoteType,
    onDelete?: () => void
    onChange?: (note: NoteType) => void
    onMove?: (note: NoteType) => void
    readonly: boolean
    onClick?: () => void
}

export default class Note extends React.Component<Props, State> {

    readonly note: React.RefObject<HTMLDivElement>
    readonly trash: React.RefObject<HTMLDivElement>
    readonly text: React.RefObject<HTMLTextAreaElement>

    constructor(props: Props) {
        super(props)
        this.state = { showColor: false, showTrash: false, note: props.note, isMove: false }
        this.note = React.createRef<HTMLDivElement>()
        this.trash = React.createRef()
        this.text = React.createRef()
    }

    colorChange(e: ColorResult) {
        if (!this.note.current) return
        const color = `rgb(${e.rgb.r},${e.rgb.g},${e.rgb.b})`
        this.note.current.style.backgroundColor = color
        const note = this.state.note
        note.color = color
        this.setState({ note: note })
        if (!this.props.onChange) return
        this.props.onChange(this.state.note)
    }

    toggleColors() {
        this.setState({ showColor: !this.state.showColor })
    }

    toggleTrash() {
        this.setState({ showTrash: !this.state.showTrash })
    }

    onStartMoving() {
        this.setState({ isMove: true, showTrash: false, showColor: false })
    }

    onEndMoving() {
        this.setState({ isMove: false })
        if (!this.props.onMove) return
        this.props.onMove(this.state.note)
    }

    cancelTrash() {
        this.setState({ showTrash: false })
    }

    onDelete() {
        const audio = new Audio('/audios/delete-paper.wav')
        audio.play().then(() => {
            this.onStartMoving()
            if (!this.props.onDelete) return
            this.props.onDelete()
        })
    }

    onMove(e: DraggableData) {
        const note = this.state.note
        note.coordinates.x = e.x
        note.coordinates.y = e.y
        this.setState({ note: note })
        if (!this.props.onChange) return
        this.props.onChange(this.state.note)
    }

    onTextChanged(e: React.ChangeEvent<HTMLTextAreaElement>) {
        const note = this.state.note
        note.text = e.target.value
        this.setState({ note: note })
        if (!this.props.onChange) return
        this.props.onChange(this.state.note)
    }

    componentDidUpdate(prevProps: Props, prevState: State): void {
        if ((prevProps.note && prevProps.note === this.props.note) || !this.props.note) return
        this.setState({ note: this.props.note })
        console.log(this.props.note)
        if (this.state.note.coordinates.x !== prevState.note.coordinates.x || this.state.note.coordinates.y !== prevState.note.coordinates.y) {
            const audio = new Audio('/audios/move-paper.wav')
            audio.play().then(() => {
            })
        }
        if (this.state.note.color && this.note.current)
            this.note.current.style.backgroundColor = this.state.note?.color
    }

    onClick() {
        if (!this.props.onClick) return
        this.props.onClick()
    }

    render() {
        return (<>
            <Draggable
                handle=".handle"
                defaultPosition={{ x: this.state.note.coordinates.x, y: this.state.note.coordinates.y }}
                position={{ x: this.state.note.coordinates.x, y: this.state.note.coordinates.y }}
                grid={[25, 25]}
                scale={1}
                disabled={this.props.readonly}
                onStart={() => this.onStartMoving()}
                onStop={() => this.onEndMoving()}
                onDrag={(_e, data) => this.onMove(data)}
            >
                <div
                    className={'note' + (this.state.isMove ? ' move' : '')}
                    ref={this.note}
                    style={{ backgroundColor: this.state.note?.color }}
                    onClick={() => this.onClick()}
                >
                    {!this.props.readonly ?
                        <div className="handle btn" onClick={() => this.onClick()}>...</div> :
                        <></>
                    }
                    <textarea
                        dir="auto"
                        ref={this.text}
                        placeholder={!this.props.readonly ? 'می توانید اینجا متنی را وارد نمایید' : ''}
                        onChange={(e) => this.onTextChanged(e)}
                        value={this.state.note.text}
                        readOnly={this.props.readonly}
                    >
                    </textarea>
                    {!this.props.readonly ? <>
                        <div className="icon" ref={this.trash} onClick={() => this.toggleTrash()}>
                            <FontAwesomeIcon
                                icon={faTrash}
                            />
                        </div>
                        <div className="icon palette">
                            <FontAwesomeIcon onClick={() => this.toggleColors()} icon={faPalette} />
                        </div>

                        {this.state.showColor &&
                            <TwitterPicker onChange={(e) => this.colorChange(e)} triangle='top-right' className="color-picker" />
                        }

                        <Overlay target={this.trash.current} show={this.state.showTrash} placement="bottom-end">
                            {(props) => (
                                <Tooltip className="text-start" {...props}>
                                    <span className="d-block">
                                        آیا شما مطمئن هستید که این مورد را حذف کنید ؟
                                    </span>
                                    <ButtonGroup dir="ltr">
                                        <Button variant="secondary" onClick={() => this.cancelTrash()}>خیر</Button>
                                        <Button variant="primary" onClick={() => this.onDelete()}>بله</Button>
                                    </ButtonGroup>
                                </Tooltip>
                            )}
                        </Overlay>
                    </>
                        : <></>
                    }
                </div>
            </Draggable >
        </>)
    }
}