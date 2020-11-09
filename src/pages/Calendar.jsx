import { IonContent, IonPage, IonSplitPane, IonMenu, IonText, IonIcon, IonMenuButton, IonRouterOutlet, IonMenuToggle, isPlatform } from '@ionic/react';
//import { chevronForwardCircle, checkmarkCircle, filterOutline, listOutline, bicycle } from 'ionicons/icons';
import React, { Component, useState, useEffect } from 'react';
import {withGetScreen} from 'react-getscreen'
import './Calendar.css'
import './Pages.css';
import ReactTooltip from 'react-tooltip';
import { withRouter } from "react-router";

import Task from './Components/Task';
import CalendarPopover from './Components/CalendarPopover';

const autoBind = require('auto-bind/react');



/* 
 *
 * Apparently,
 * People like calendars.
 *
 * WHY?
 *
 * People don't respect 
 * the existance 
 * of the whole idea of GTD.
 *
 * Seriously.
 *
 * Why. A calendar?! in a GTD app.
 *
 * FINE. Here's your calendar.
 *
 * @jemoka
 *
 *
 */

function CalPagelendar(props) {

    function __util_calculate_gradient(left, right, gradientAmount) {
        let color1 = left;
        let color2 = right;
        let ratio = gradientAmount;
        let hex = function(x) {
            x = x.toString(16);
            return (x.length == 1) ? '0' + x : x;
        };

        let r = Math.ceil(parseInt(color1.substring(0,2), 16) * ratio + parseInt(color2.substring(0,2), 16) * (1-ratio));
        let g = Math.ceil(parseInt(color1.substring(2,4), 16) * ratio + parseInt(color2.substring(2,4), 16) * (1-ratio));
        let b = Math.ceil(parseInt(color1.substring(4,6), 16) * ratio + parseInt(color2.substring(4,6), 16) * (1-ratio));

        return hex(r) + hex(g) + hex(b);
    }

    let [dateSelected, setDateSelected] = useState(new Date());

    let currentMonth = dateSelected.getMonth();
    let currentYear = dateSelected.getFullYear();

    let firstDayMonth = new Date(currentYear, currentMonth, 1);
    let lastDayMonth = new Date(currentYear, currentMonth+1, 0);
    let lastDayLastMonth = new Date(currentYear, currentMonth, 0);

    let firstDayDayname = firstDayMonth.getDay()+1;

    let daysBefore = [...new Array(firstDayDayname-1)].map((_, i)=>{return {type: "pre", content: i+lastDayLastMonth.getDate()-(firstDayDayname-1)+1}});

    let daysAfter = [...new Array((6-lastDayMonth.getDay()===-1)?6:6-lastDayMonth.getDay())].map((_, i)=>{return {type:"post", content:i+1}});

    let contentDays = [...new Array(lastDayMonth.getDate())].map((_, i)=>{return {type:"actual", content:i+1}});

    let [heat, setHeat] = useState({});
    
    useEffect(()=>{
        (async function() {
            let map = new Map();
            let hm = {};
            let taskList = await props.engine.db.selectTasksInRange(props.uid, firstDayMonth, lastDayMonth, true);
            taskList.forEach(([_, val])=>{
                let date = new Date(val.due.seconds*1000);
                date.setHours(0, 0, 0, 0);
                let time = date.getDate();
                if(map.has(time))
                    map.set(time, map.get(time)+1);
                else
                    map.set(time, 1);
            });
            let values = Array.from(map.values());
            let sum = values.reduce((a, b) => {
                return a + b;
            });
            let style = getComputedStyle(document.body);
            let hexes = values.map(e=>__util_calculate_gradient(style.getPropertyValue('--decorative-light').trim().slice(1), style.getPropertyValue('--background-feature').trim().slice(1), e/sum));
            Array.from(map.keys()).forEach((e, i)=>{hm[e]=hexes[i]});
            setHeat(hm);
        })();
    },[dateSelected]);

    return (
        <div id="calendar-page-calendar-wrapper" style={{display: "inline-block", ...props.style}}>
            <div id="calendar-wrapper">
                <div id="calendar-daterow">
                    <span className="calendar-daterow-item">Sun</span>
                    <span className="calendar-daterow-item">Mon</span>
                    <span className="calendar-daterow-item">Tues</span>
                    <span className="calendar-daterow-item">Wed</span>
                    <span className="calendar-daterow-item">Thu</span>
                    <span className="calendar-daterow-item">Fri</span>
                    <span className="calendar-daterow-item">Sat</span>
                </div>
                <div id="calendar-container">
                    {[...daysBefore,...contentDays,...daysAfter].map(i =>
                    <span className={`calendar-container-item calendar-container-item-${i.type} calendar-container-item-${i.content}`} style={{backgroundColor: (i.type === "actual" && i.content === dateSelected.getDate()) ? "var(--decorative-light)":((heat[i.content]&&i.type === "actual") ? `#${heat[i.content]}` : "inherit")}} onClick={(e)=>{
                        let date;
                        if (i.type === "pre")
                            date = new Date(lastDayLastMonth.getFullYear(), lastDayLastMonth.getMonth(), i.content);
                        if (i.type === "actual") 
                            date = new Date(firstDayMonth.getFullYear(), firstDayMonth.getMonth(), i.content);
                        if (i.type === "post") 
                            date = new Date(firstDayMonth.getFullYear(), firstDayMonth.getMonth()+1, i.content);
                        setDateSelected(date);
                        if (props.onDateSelected)
                            props.onDateSelected(date);
                    }}>{i.content}</span>
                    )}
                </div>
                <div id="calendar-infopanel">
                    <div className="calendar-infopanel-dateselected">{dateSelected.getDate()}</div>
                    <div className="calendar-infopanel-datename">{dateSelected.toLocaleString('en-us', {  weekday: 'long' })}</div>
                    <div className="calendar-infopanel-month">{dateSelected.toLocaleString('en-us', { month: 'long' })}</div>
                    <div className="calendar-infopanel-year">{dateSelected.getFullYear()}</div>
                </div>
                <div id="calendar-tools">
                    <a className="fas fa-caret-left calendar-button" onClick={()=>{
                        let date = new Date(firstDayMonth.getFullYear(), firstDayMonth.getMonth()-1, 1);
                        setDateSelected(date);
                        if (props.onDateSelected)
                            props.onDateSelected(date);

                    }}></a>
                    <a className="fas fa-caret-right calendar-button" onClick={()=>{
                        let date = new Date(firstDayMonth.getFullYear(), firstDayMonth.getMonth()+1, 1);
                        setDateSelected(date);
                        if (props.onDateSelected)
                            props.onDateSelected(date);

                    }}></a>
                    <div className="calendar-today" onClick={()=>{
                        setDateSelected(new Date());
                        if (props.onDateSelected)
                            props.onDateSelected(new Date());

                    }}>Today</div>

                </div>
            </div>
        </div>
    )
}



class Calendar extends Component {

    constructor(props) {
        super(props);

        let today = new Date();
        today.setHours(0,0,0,0);

        this.state = {
            possibleProjects:{}, // stuff for tasks and projects to work: see jacks comments in upcoming 
            possibleTags:{}, 
            possibleProjectsRev:{}, 
            possibleTagsRev:{}, 
            availability: [], 
            projectSelects:[], 
            tagSelects: [], 
            projectDB: {},
            currentDate: (today), // new date
            taskList: [],
            popoverIsVisible: false,

        };

        this.updatePrefix = this.random();
        this.props.gruntman.registerRefresher((this.refresh).bind(this));
        this.repeater = React.createRef(); // what's my repeater? | i.. i dont know what this does...

        // AutoBind!
        autoBind(this);
    }
    showEdit() {
        this.setState({showEdit: true})
    } // util func for showing repeat
    hideEdit() {
        this.setState({showEdit: false});
    } // util func for hiding repeat

    componentWillUnmount() {
        this.props.gruntman.halt(); // when we unmount, halt gruntman? idk what this does  
    }

    async refresh() {
        let avail = await this.props.engine.db.getItemAvailability(this.props.uid) // get availability of items
        let pPandT = await this.props.engine.db.getProjectsandTags(this.props.uid); // get projects and tags


        let projectList = []; // define the project list
        let tagsList = []; // define the tag list

        for (let pid in pPandT[1][0]) // tag nd project stuff 
            tagsList.push({value: pid, label: pPandT[1][0][pid]});
        let views = this;
        let projectDB = await (async function() {
            let pdb = [];
            let topLevels = (await views.props.engine.db.getTopLevelProjects(views.props.uid))[0];
            for (let key in topLevels) {
                pdb.push(await views.props.engine.db.getProjectStructure(views.props.uid, key, true));
            }
            return pdb;
        }());

        let buildSelectString = function(p, level) {
            if (!level)
                level = ""
            projectList.push({value: p.id, label: level+pPandT[0][0][p.id]})
            if (p.children)
                for (let e of p.children)
                    if (e.type === "project")
                        buildSelectString(e.content, level+":: ");
        };

        projectDB.map(proj=>buildSelectString(proj));

        let endDate = new Date(this.state.currentDate);
        endDate.setHours(23,59,59,60);
        let taskList = await this.props.engine.db.selectTasksInRange(this.props.uid, this.state.currentDate, endDate);

        this.setState({
            possibleProjects: pPandT[0][0],	     // set the project stuff
            possibleTags: pPandT[1][0],		    // set the tag stuff  
            possibleProjectsRev: pPandT[0][1],	   // set more projects stuff  
            possibleTagsRev: pPandT[1][1],	  // set more tags stuff  
            availability: avail,		 // set the avail
            projectSelects: projectList,	// set the project list  
            tagSelects: tagsList,	       // set the tag list
            projectDB, 			      // and the project db 
            taskList
        }); // once we finish, set the state
    }

    componentDidMount() {
        this.refresh()
    }

    random() { return (((1+Math.random())*0x10000)|0).toString(16)+"-"+(((1+Math.random())*0x10000)|0).toString(16);}

    render() {
        return (
            <IonPage>
                {/* the perspective editor! */}
                <div className={"page-invis-drag " + (()=>{
                    if (!isPlatform("electron")) // if we are not running electron
                        return "normal"; // normal windowing proceeds
                    else if (window.navigator.platform.includes("Mac")){ // macos
                        return "darwin"; // frameless setup
                    }
                    else if (process.platform === "win32") // windows
                        return "windows"; // non-frameless

                })()}>&nbsp;</div>
                <div className={"page-content " + (()=>{
                    if (!isPlatform("electron")) // if we are not running electron
                        return "normal"; // normal windowing proceeds
                    else if (window.navigator.platform.includes("Mac")){ // macos
                        return "darwin"; // frameless setup
                    }
                    else if (process.platform === "win32") // windows
                        return "windows"; // non-frameless

                })()}>

                    <div className="header-container" >
                        <div style={{display: "inline-block"}}>
                            <div> 
                                <IonMenuToggle>
                                    <i className="fas fa-bars" 
                                        style={{marginLeft: 20, color: "var(--decorative-light-alt"}} />
                                </IonMenuToggle> 
                                <h1 className="page-title">
                                    <i style={{paddingRight: 10}} 
                                        className="fas fa-calendar-alt">
                                    </i>
                                    Calendar
                                </h1> 
                                <ReactTooltip effect="solid" offset={{top: 3}} backgroundColor="black" className="tooltips" />
                            </div> 
                        </div>
                    </div>
                    <div style={{marginLeft: 10, marginRight: 10, overflowY: "scroll"}}>
                        <div id="calendar-page-wrapper">
                            {(()=>{
                                if (this.props.isMobile())
                                    return <CalendarPopover uid={this.props.uid} engine={this.props.engine} isShown={this.state.popoverIsVisible} onDidDismiss={()=>this.setState({popoverIsVisible: false})}  onDateSelected={(async function(d){
                                        let endDate = new Date(d.getTime());
                                        endDate.setHours(23,59,59,60);
                                        let taskList = await this.props.engine.db.selectTasksInRange(this.props.uid, d, endDate);
                                        this.setState({currentDate: d, taskList});
                                    }).bind(this)}/>
                                else 
                                    return <CalPagelendar uid={this.props.uid} engine={this.props.engine} onDateSelected={(async function(d){
                                        let endDate = new Date(d.getTime());
                                        endDate.setHours(23,59,59,60);
                                        let taskList = await this.props.engine.db.selectTasksInRange(this.props.uid, d, endDate);
                                        this.setState({currentDate: d, taskList});
                                    }).bind(this)}/>
                            })()}
                            <div id="calendar-page-taskpage-wrapper">
                                <span id="calendar-page-header">
                                    <div class="calendar-page-count">{this.state.taskList.length}</div>
                                    <div class="calendar-page-title">tasks due on</div>
                                    <div class="calendar-page-date" onClick={()=>this.setState({popoverIsVisible: true})}>{this.state.currentDate.toLocaleString('en-us', {  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'  })}</div>
                                    {(()=>{
                                        if (this.props.isMobile())
                                            return <a class="calendar-page-select fas fa-calendar-day" data-tip="Pick Date" onClick={()=>this.setState({popoverIsVisible: true})}></a>
                                    })()}
                                </span>
                                {this.state.taskList.map(id=>(
                                    <Task tid={id} key={id+"-"+this.updatePrefix} uid={this.props.uid} engine={this.props.engine} gruntman={this.props.gruntman} availability={this.state.availability[id]} datapack={[this.state.tagSelects, this.state.projectSelects, this.state.possibleProjects, this.state.possibleProjectsRev, this.state.possibleTags, this.state.possibleTagsRev]}/>
                                ))}
                            </div>
                        </div>
                        <div className="bottom-helper">&nbsp;</div>
                    </div>
                </div>
            </IonPage>
        )
    }
}
export default withGetScreen(Calendar, {mobileLimit: 720, tabletLimit:768, shouldListenOnResize: true});

