import React from "react";
import { Edge, StateNode } from "../state-diagram/state-diagram-interfaces";
import styles from '../../styles/design.module.scss'
import StateTable from "./StateTable";
import { generateKMap, getBinRepresentation, getExcitations, getLiteral, getNextStateMap, getRequiredBitForStates, maximalCompatibles, simplifyFunction, stateMinimization, truthTablesFromExcitation } from "./helperFunctions";
import {  kMap, truthTable } from "./interfaces";
import ExcitaitonTable from "./ExcitationTable";
import KMap from './kMap'
import ImplicationTable from "./ImplicationTable";
import StateAssignment from "./StateAssignment";
import MergerDiagram from "./MergerDiagram";


const SRMap = {
    '00' : '0d',
    '01' : '10',
    '10' : '01',
    '11' : 'd0'
}
const JKMap = {
    '00' : '0d',
    '01' : '1d',
    '10' : 'd1',
    '11' : 'd0'
}
const DMap = {
    '00' : '0',
    '01' : '1',
    '10' : '0',
    '11' : '1'
}
const TMap = {
    '00' : '0',
    '01' : '1',
    '10' : '1',
    '11' : '0'
}

const Design : React.FC<{
    stateNodes : StateNode[],
    edges : Edge[],
    numberOfInpVar : number,
    changeSynthesis : (b : boolean) => void,
    numberOfOutputVars : number
}> = (props)=>{

    let stateVars = getRequiredBitForStates(props.stateNodes.length) ;
    let numberOfVars = stateVars + props.numberOfInpVar;
    const binRep = getBinRepresentation(props.stateNodes);
    let excitations = getExcitations(props.stateNodes, binRep, props.numberOfInpVar,JKMap, 2, props.numberOfOutputVars);
    excitations = [... excitations.filter(e => e.type === 'state'), ... excitations.filter(e => e.type === 'output')]
    const nextStateMap = getNextStateMap(props.stateNodes, props.numberOfInpVar);
    let truthTables : truthTable[] = [];
    excitations.forEach(e=> truthTables.push(...truthTablesFromExcitation(e, numberOfVars, stateVars, e.type === 'output' ? 'z' : 'JK')));
    let kMaps : kMap[] = [];
    truthTables.forEach(t=>kMaps.push(generateKMap(t,numberOfVars)));

    const implicationEntries = stateMinimization(props.stateNodes.map(s=>s.label), nextStateMap, props.numberOfInpVar);

    maximalCompatibles(props.stateNodes.map(s => s.label), implicationEntries);
    
    

    // let stateLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
    // let nextStateMap2 : nextStateMap = {
    //     ['A'] : {
    //         '0' : {
    //             output : '0',
    //             state : 'E'
    //         },
    //         '1' : {
    //             output : '0',
    //             state : 'D'
    //         }
    //     },
    //     ['B'] : {
    //         '0' : {
    //             output : '1',
    //             state : 'A'
    //         },
    //         '1' : {
    //             output : '0',
    //             state : 'F'
    //         }
    //     },
    //     ['C'] : {
    //         '0' : {
    //             output : '0',
    //             state : 'C'
    //         },
    //         '1' : {
    //             output : '1',
    //             state : 'A'
    //         }
    //     },
    //     ['D'] : {
    //         '0' : {
    //             output : '0',
    //             state : 'B'
    //         },
    //         '1' : {
    //             output : '0',
    //             state : 'A'
    //         }
    //     },
    //     ['E'] : {
    //         '0' : {
    //             output : '1',
    //             state : 'D'
    //         },
    //         '1' : {
    //             output : '0',
    //             state : 'C'
    //         }
    //     },
    //     ['F'] : {
    //         '0' : {
    //             output : '0',
    //             state : 'C'
    //         },
    //         '1' : {
    //             output : '1',
    //             state : 'D'
    //         }
    //     },
    //     ['G'] : {
    //         '0' : {
    //             output : '1',
    //             state : 'H'
    //         },
    //         '1' : {
    //             output : '1',
    //             state : 'G'
    //         }
    //     },
    //     ['H'] : {
    //         '0' : {
    //             output : '1',
    //             state : 'C'
    //         },
    //         '1' : {
    //             output : '1',
    //             state : 'B'
    //         }
    //     },
        
    // }

    // return(
    //     <div>
    //         <ImplicationTable labels = {stateLabels} entries = {stateMinimization(stateLabels, nextStateMap2,1)} />
    //     </div>
    // )

    console.log(implicationEntries);

    return (
        <div className={styles.synthesisContainer}>
            <details>
                <summary>State Table</summary>
                <StateTable showOutput={true}  nextStateMap = {nextStateMap} numberOfInpVar = {props.numberOfInpVar} stateNodes = {props.stateNodes}/>
            </details>
            <details>
                <summary> Implication Table </summary>
                <ImplicationTable labels = {props.stateNodes.map(s=>s.label)} entries = {implicationEntries} />
            </details>
            <details>
                <summary> Merger Diagram For Compatibles </summary>
                <MergerDiagram entries = {implicationEntries} stateLabels = {props.stateNodes.map(s => s.label)} />
            </details>
            <details>
                <summary> Merger Diagram For Incompatibles </summary>
                <MergerDiagram inCompatibles={true} entries = {implicationEntries} stateLabels = {props.stateNodes.map(s => s.label)} />
            </details>
            <details>
                <summary> State Assignment </summary>
                <StateAssignment binRep = {binRep} stateNodes = {props.stateNodes}  />
            </details>
            <details>
                <summary>Transition Table</summary>
                <StateTable  nextStateMap = {nextStateMap} binRep = {binRep} numberOfInpVar = {props.numberOfInpVar} stateNodes = {props.stateNodes}/>
            </details>
            <details>
                <summary>Excitation Table</summary>
                <ExcitaitonTable  excitations = {excitations} stateNodes = {props.stateNodes} binRep = {binRep} latchLabel = 'SR' latchMap = {SRMap} numberOfInputVars = {props.numberOfInpVar}  />
            </details>
            <details>
                <summary> KMaps </summary>
            {
                kMaps.map((k, index)=>{
                    let r = simplifyFunction(truthTables[index]);
                    let s = '';
                    r.selectedPIs.forEach(e=> s+= getLiteral(e.comb, truthTables[index].vars) + ' + ' );
                    s = s.slice(0, s.length - 3);
                    if(s == '')
                        s = '0'
                    let key = 0;
                    return(
                        <div key = {k.functionName} className={styles.functionBlockContainer}>
                            <details>
                                <summary>{ k.functionName.split('').map(c => Number.isInteger(parseInt(c)) ? (<sub key={key++}>{c}</sub>) : c)} </summary>
                                <div className = {styles.functionBlock}> 
                                    {/* <div> {k.functionName} </div> */}
                                    <KMap key = {key++} kMap = {k} />
                                    <div> {k.functionName.split('').map(c => Number.isInteger(parseInt(c)) ? (<sub key={key++}>{c}</sub>) : c)} = {s.split('').map(c => Number.isInteger(Number.parseInt(c)) ? <sub key={key++}>{c}</sub> : c  )} </div>
                                </div>
                            </details>
                        </div>
                    )
                })
            }
            </details>
            <div className={styles.backButtonContainer}>
                <button onClick = {()=> props.changeSynthesis(false)}> back to diagram </button>
            </div>
        </div>
    )
}


export default Design;