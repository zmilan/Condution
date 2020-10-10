import { IonModal, IonContent, IonSelect, IonSelectOption } from '@ionic/react';
import { Dropdown } from 'react-bootstrap';
//import { chevronForwardCircle, checkmarkCircle, filterOutline, listOutline, bicycle } from 'ionicons/icons';
import React, { Component } from 'react';
import './Repeat.css';
//import OutsideClickHandler from 'react-outside-click-handler';
import "react-datepicker/dist/react-datepicker.css";
import * as chrono from 'chrono-node';
import Select from 'react-select'


/*
 * Hello human,
 * good morning.
 *
 * I am the repeat UI
 *
 * Rule denotes the repeat major rule: {no repeat, daily, weekly: yearly}
 * Advanced denotes whether the user is using fancy repeat
 * On denotes the advanced repeat signals. (like mon, tue, sat or something.)
 *
 * @jemoka
 *
 */

const autoBind = require('auto-bind/react');

class Repeat extends Component {
    constructor(props) {
        super(props);
        autoBind(this);

        this.state = {
            name: "", // task's name
            rule: "none", // the repeat rule
            advanced: false, // advanced or not
            on: undefined, // advanced repeat rules
        }
    }

    async loadTask() {
        let taskInfo = await this.props.engine.db.getTaskInformation(this.props.uid, this.props.tid);
        this.setState({
            name: taskInfo.name, // name is name
            rule: taskInfo.repeat ? taskInfo.repeat.rule : "none", // rule is rule, if there's a rule
            advanced: taskInfo.repeat ? (taskInfo.repeat.on !== undefined) : false, // on is on, if there's a rule
            on: taskInfo.repeat ? taskInfo.repeat.on : undefined, // on is on, if there's a rule
        });
    }

    componentDidMount() {
        this.loadTask();
    }

    render() {
        return (
            <IonModal ref={this.props.reference} isOpen={this.props.isShown} onDidDismiss={() => {if(this.props.onDidDismiss) this.props.onDidDismiss()}} style={{borderRadius: 5}} cssClass={"task-repeat "+(()=>{
                // Different repeat modes require different height modals
                 switch (this.state.rule) {
                      case "none":
                          return "task-repeat__default";
                      case "daily":
                          return "task-repeat__default";
                      case "weekly2":
                          return "task-repeat__default";
                      case "monthly":
                          return (this.state.advanced ? "task-repeat__advanced-monthly" : "task-repeat__default");
                      case "yearly":
                          return "task-repeat__default";
                  }
            })()}>
                <div>
                    {/* Header */}
                    <div className="repeat-header">
                        {/* Repeat name */}
                        <span style={{display: "flex", alignItems: "center", width: "100%"}}><b>Repeat</b> <div className="repeat-task-name">{this.state.name}</div></span>
                        {/* Close button */}
                        <a className="repeat-close" onClick={this.props.onDidDismiss}><i className="fa fa-times"></i></a>
                    </div>
                    <div>
                        <div className="repeat-basic-row">
                            <div className="repeat-rule-selector">
                            <span>
                                <i className="repeat-label fa fa-redo"></i>
                                <span className="repeat-label">Repeat</span>
                            </span>
                            {/* The big select, force iOS style */}
                            <IonSelect className="repeat-select" interface="popover" value={this.state.rule} mode="ios" onIonChange={e=>{
                                    // Set the repeat
                                    this.props.gruntman.do(
                                        "task.update", 
                                        { uid: this.props.uid, tid: this.props.tid, query:{repeat: {rule: e.detail.value}}}
                                    )

                                    // Set the state too!
                                    this.setState({rule: e.detail.value, advanced: false, on: undefined});
 
                                }}>
                                <IonSelectOption className="repeat-select__option" value="none">None</IonSelectOption>
                                <IonSelectOption className="repeat-select__option" value="daily">Daily</IonSelectOption>
                                <IonSelectOption className="repeat-select__option" value="weekly2">Weekly</IonSelectOption>
                                <IonSelectOption className="repeat-select__option" value="monthly">Monthly</IonSelectOption>
                                <IonSelectOption className="repeat-select__option" value="yearly">Yearly</IonSelectOption>
                            </IonSelect>
                            </div>
                                {
                                    
                                <a style={{color: "var(--decorative-light-alt)", float: "right", cursor: "pointer", display: ["weekly2", "monthly"].includes(this.state.rule) ? "inline" : "none" }} className={"fas " + (this.state.advanced ? "fa-caret-down":"fa-caret-up")} onClick={()=> {
                                    if (this.state.advanced) {
                                        this.props.gruntman.do(
                                            "task.update", 
                                            { uid: this.props.uid, tid: this.props.tid, query:{repeat: {rule: this.state.rule}}}
                                        ) // undo advanced 
                                        this.setState({rule: this.state.rule, advanced: false, on: undefined}); // set the state too!
                                    } else {
                                        this.props.gruntman.do(
                                            "task.update", 
                                            { uid: this.props.uid, tid: this.props.tid, query:{repeat: {rule: this.state.rule, on: []}}}
                                        ) // do advanced 
                                        this.setState({rule: this.state.rule, advanced: true, on: []}); // set the state too!
                                    }
                                }}></a>
                                }
                        </div>
                    </div>
                    <div style={{margin: "10px 20px", color: "var(--content-normal-alt)"}}>
                        {(()=>{
                            if (this.state.advanced)
                                switch (this.state.rule) {
                                    case "monthly":
                                        return (
                                            <div className="repeat-dategrid">
                                                {/* Why, you ask? Because numbers may not be numbers in outher countires */}
                                                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "Last"].map(e => <a className={"repeat-dategrid-number "+ (()=>{if(this.state.on)  return (this.state.on.includes(e.toLowerCase()) ? "repeat-dategrid-number-selected":""); else return ""})()} onClick={()=>{
                                                    if (this.state.on.includes(e.toLowerCase())) {
                                                        let oldOn = this.state.on;
                                                        let newOn = oldOn.filter(elem=>elem!==e.toLowerCase());
                                                        console.log(e, newOn);
                                                        // toggle it off
                                                        this.props.gruntman.do(
                                                            "task.update", 
                                                            { uid: this.props.uid, tid: this.props.tid, query:{repeat: {rule: this.state.rule, on: newOn}}}
                                                        )
                                                        this.setState({on: newOn});
                                                    } else  {
                                                        let oldOn = this.state.on;
                                                        oldOn.push(e.toLowerCase());
                                                        let newOn = oldOn;
                                                        // toggle it on
                                                        this.props.gruntman.do(
                                                            "task.update", 
                                                            { uid: this.props.uid, tid: this.props.tid, query:{repeat: {rule: this.state.rule, on: newOn}}}
                                                        )
                                                        this.setState({on: newOn});
                                                    }
                                                }}>{e}</a>)}
                                            </div>
                                        );
                                }
                        })()}
                    </div>
                </div>
            </IonModal>
        )
    }


}

export default Repeat;

