import React from "react";
import { Edge, StateNode } from "../state-diagram/state-diagram-interfaces";
import styles from '../../styles/design.module.scss'
import StateTable from "./StateTable";
import { generateKMap, getBinRepresentation, getLiteral, getNextStateMap, getRequiredBitForStates, getMaximals, simplifyFunction, stateMinimization, truthTablesFromExcitation, getExcitationsFromNextStateMap, getMinimumClosure, getReducedNextStateMap, getNewLabels, useLabelMap, StringIdGenerator } from "./helperFunctions";
import {  circuitMode, excitationInterface, implicationEntryMap, kMap, LatchType, nextStateMap, stringToStringMap, truthTable } from "./interfaces";
import ExcitaitonTable from "./ExcitationTable";
import KMap from './KMapCanvas'
import ImplicationTable from "./ImplicationTable";
import StateAssignment from "./StateAssignment";
import MergerDiagram from "./MergerDiagram";
import { useState, useEffect } from "react";
import ClosureTable from "./ClosureTable";
import ReducedStates from "./ReducedStates";
import FuncionEquation from "./FunctionEquation";
import PrimeImplicants from "./PrimeImplicants";


const SRMap = {
    '00' : '0d',
    '01' : '10',
    '10' : '01',
    '11' : 'd0',
    '0d' : 'dd',
    '1d' : 'dd'
}
const JKMap = {
    '00' : '0d',
    '01' : '1d',
    '10' : 'd1',
    '11' : 'd0',
    '0d' : 'dd',
    '1d' : 'dd'
}
const DMap = {
    '00' : '0',
    '01' : '1',
    '10' : '0',
    '11' : '1',
    '0d' : 'd',
    '1d' : 'd'
}
const TMap = {
    '00' : '0',
    '01' : '1',
    '10' : '1',
    '11' : '0',
    '0d' : 'd',
    '1d' : 'd'
}

const Design : React.FC<{
    stateNodes : StateNode[],
    edges : Edge[],
    numberOfInpVar : number,
    changeSynthesis : (b : boolean) => void,
    circuitMode : circuitMode
    numberOfOutputVars : number,
}> = (props)=>{

    const [nextStateMap , setNextStateMap] = useState<nextStateMap | null>(null);
    const [labelMap, setLabelMap] = useState<stringToStringMap | undefined>(undefined);
    const [labels, setLabels] = useState<string[]>([]);
    useEffect(()=>{
        let ids = new StringIdGenerator();
        let temp : stringToStringMap = {};
        let internalMap : stringToStringMap = {};
        props.stateNodes.forEach(s =>{
            // let t = s.label;
            // s.label = ids.next();
            // temp[s.label] = t;
            let iLabel = ids.next();
            temp[iLabel] = s.label;
            internalMap[s.label] = iLabel;
        })
        setLabelMap(temp);
        setLabels(props.stateNodes.map(s => internalMap[s.label]))
        getNextStateMap(props.stateNodes, internalMap, props.numberOfInpVar, props.numberOfOutputVars,props.circuitMode).then(s=>{
            setNextStateMap(s);
        })
        
    }, [props])
    return (
        <div>
            {
                !nextStateMap && <div className = {styles.processingTextContainer}> calculating... </div>
            }
            {
                nextStateMap && <FromNextStateMap circuitMode = {props.circuitMode} nextStateMap = {nextStateMap} 
                labelMap = {labelMap} labels = {labels} changeSynthesis={props.changeSynthesis} />
            }
        </div>
    )
}

const getLatchMap = (l :LatchType)=>{
    if(l === 'JK') return JKMap;
    else if(l === 'SR') return SRMap;
    else if(l === 'D') return DMap;
    return TMap;
}

interface FNSMprops {
    labels : string[],
    nextStateMap : nextStateMap | null,
    changeSynthesis : (b : boolean) => void,
    labelMap? : {[label : string] : string},
    circuitMode : circuitMode

}

interface FNSMState{
    reducedNextStateMap : nextStateMap | null,
    excitations : excitationInterface[] | null,
    implicationEntries : implicationEntryMap | null,
    truthTables : truthTable[] | null,
    kMaps : kMap[] | null,
    maximalCompatibles : string[][] | null
    maximalIncompatibles : string[][] | null,
    compatibles : string[][] | null,
    newLabels : string[] | null,
    binRep : stringToStringMap,
    labelMap : stringToStringMap | undefined,
    reducedLabelMap : stringToStringMap | undefined,
    latch : LatchType
}

export class FromNextStateMap extends React.Component<FNSMprops ,FNSMState >{

    constructor(props : FNSMprops){
        super(props);
        this.state = {
            reducedNextStateMap : null,
            excitations : null,
            implicationEntries : null,
            truthTables : null,
            kMaps : null,
            maximalCompatibles : null,
            maximalIncompatibles : null,
            compatibles : null,
            newLabels : null,
            binRep : getBinRepresentation(this.props.labels),
            labelMap : this.props.labelMap,
            reducedLabelMap : undefined,
            latch : 'JK'
        }
        this.getAllTruthTables = this.getAllTruthTables.bind(this);
        this.getAllKmaps = this.getAllKmaps.bind(this);
        this.onBinRepChange = this.onBinRepChange.bind(this);
        this.setReducedLabelMap = this.setReducedLabelMap.bind(this);
        this.onLatchChange = this.onLatchChange.bind(this);
    }

    // const [reducedNextStateMap, setReducedNextStateMap] = useState<nextStateMap | null>(null);
    // const [excitations, setExcitations] = useState<excitationInterface[] | null>(null);
    // const [implicationEntries, setImplicationEntries] = useState<implicationEntryMap | null>(null);
    // const [truthTables, setTruthTables] = useState<truthTable[] | null>(null);
    // const [kMaps, setKMaps] = useState<kMap[]|null>(null);
    // const [maximalCompatibles, setMaximalCompatibles] = useState<string[][] | null>(null);
    // const [maximalIncompatibles, setMaximalIncompatibles] = useState<string[][] | null>(null);
    // const [compatibles, setCompatibles] = useState<string[][] | null>();
    // const [newLabels , setNewLabels ] = useState<string[]>(this.props.labels);
    // const [binRep, setBinRep] = useState<stringToStringMap>(getBinRepresentation(this.props.labels));
    // const [labelMap, setLabelMap] = useState<{[label : string] : string} | undefined>(this.props.labelMap);
    // const [reducedLabelMap, setReducedLabelMap] = useState<stringToStringMap | undefined >(undefined);
    

    onLatchChange = (newLatch : LatchType)=>{
        getExcitationsFromNextStateMap(this.state.newLabels!, this.state.reducedNextStateMap!, this.state.binRep,
            getLatchMap(newLatch),newLatch.length , this.props.circuitMode)
            .then(async e=>{
                e = await getExcitationsFromNextStateMap(this.state.newLabels!,this.state.reducedNextStateMap!,
                    this.state.binRep,getLatchMap(newLatch),newLatch.length, this.props.circuitMode);
                e = [...e.filter(e=> e.type === 'state'), ... e.filter(e=> e.type === 'output')]
                console.log(e);
                // setExcitations(e);
                let t = await this.getAllTruthTables(e, newLatch);
                // setTruthTables(t);
                let k = await this.getAllKmaps(t);

                this.setState({
                    latch : newLatch,
                    excitations : e,
                    truthTables : t,
                    kMaps : k
                })
            })
    }


    getAllTruthTables = async (excitations : excitationInterface[], latch : LatchType) : Promise<truthTable[]>=>{
        let t : truthTable[] = [];
        excitations.forEach(async e =>{
            let temp = await truthTablesFromExcitation(e,e.type === 'output' ? 'z' : latch, this.props.circuitMode);
            t.push(...temp);
        })
        return t;
    }
    
    getAllKmaps = async (truthTables : truthTable[]) : Promise<kMap[]> =>{
        let k : kMap[] = [];
        truthTables.forEach(async t=>{
            let temp = await generateKMap(t, this.props.circuitMode,this.props.nextStateMap?.numberOfInputVar);
            console.log(temp);
            k.push(...temp);
        });
        return k;
    }

    onBinRepChange = (b : stringToStringMap)=>{
        // setBinRep(b);
        getExcitationsFromNextStateMap(this.state.newLabels!,this.state.reducedNextStateMap!,b,JKMap,2, this.props.circuitMode).then(async e=>{
            e = await getExcitationsFromNextStateMap(this.state.newLabels!,this.state.reducedNextStateMap!,b,JKMap,2, this.props.circuitMode);
            e = [...e.filter(e=> e.type === 'state'), ... e.filter(e=> e.type === 'output')]
            console.log(e);
            // setExcitations(e);
            let t = await this.getAllTruthTables(e, this.state.latch);
            // setTruthTables(t);
            let k = await this.getAllKmaps(t);

            this.setState({
                binRep : b,
                excitations : e,
                truthTables : t,
                kMaps : k
            })
            // setKMaps(k);
        })
    }

    // useEffect(()=>{
    //     getExcitationsFromNextStateMap(newLabels,reducedNextStateMap!,binRep,JKMap,2, this.props.circuitMode).then(async e=>{
    //         e = await getExcitationsFromNextStateMap(newLabels,reducedNextStateMap!,binRep,JKMap,2, this.props.circuitMode);
    //         e = [...e.filter(e=> e.type === 'state'), ... e.filter(e=> e.type === 'output')]
    //         setExcitations(e);
    //         let t = await getAllTruthTables(e);
    //         setTruthTables(t);
    //         let k = await getAllKmaps(t);
    //         setKMaps(k);
    //     })
        
    // }, [binRep])

    
    componentDidMount = ()=>{
        if(!this.props.nextStateMap) return;
        let stateVars = getRequiredBitForStates(this.props.labels.length) ;
        let numberOfVars = stateVars + this.props.nextStateMap.numberOfInputVar;

        

        stateMinimization(this.props.labels, this.props.nextStateMap, this.props.circuitMode)
        .then(async s=>{
            this.setState({implicationEntries : s})
            // setImplicationEntries(s);
            let mx = await getMaximals(this.props.labels,s);
            this.setState({maximalCompatibles : mx})
            // setMaximalCompatibles(mx);
            let mx2 = await getMaximals(this.props.labels, s, true);
            this.setState({maximalIncompatibles : mx2})
            // setMaximalIncompatibles(mx2); 
            let upperBound = mx.length > this.props.labels.length ? this.props.labels.length : mx.length;
            let lowerBound = upperBound;
            mx2.forEach(m => lowerBound = lowerBound > m.length ? m.length : lowerBound);
            let comp = await getMinimumClosure(this.props.labels,mx, this.props.nextStateMap!,upperBound, lowerBound, this.props.circuitMode);
            this.setState({
                compatibles : comp
            })
            // setCompatibles(comp);
            let newLabels = await getNewLabels(comp.length);
            // this.setState({newLabels : newLabels})
            // setNewLabels(newLabels);
            let binRep = getBinRepresentation(newLabels);
            this.setState({binRep : binRep , newLabels : newLabels})
            // setBinRep(binRep);
            let newNxt = await getReducedNextStateMap(newLabels,comp, this.props.nextStateMap!, this.props.circuitMode);
            this.setState({reducedNextStateMap : newNxt})
            // setReducedNextStateMap(newNxt);
            let e = await getExcitationsFromNextStateMap(newLabels,newNxt,binRep,JKMap,2, this.props.circuitMode);
            e = [...e.filter(e=> e.type === 'state'), ... e.filter(e=> e.type === 'output')]
            this.setState({excitations : e})
            // setExcitations(e);
            let t = await this.getAllTruthTables(e, this.state.latch);
            this.setState({truthTables : t})
            // setTruthTables(t);
            let k = await this.getAllKmaps(t);
            // setKMaps(k);
            this.setState({kMaps : k})
        })
        
    }   
    
    setReducedLabelMap = (labelMap : stringToStringMap | undefined)=>{
        this.setState({
            reducedLabelMap : labelMap
        })
    }

    render(){

        return (
            <div className={styles.synthesisContainer}>
                <Details summary = {'State Table'} 
                content = {this.props.nextStateMap && <StateTable circuitMode = {this.props.circuitMode} labelMap = {this.state.labelMap}  nextStateMap = {this.props.nextStateMap} stateLabels = {this.props.labels}/>} />
                <Details summary = {'Implication Table'} 
                content = {this.state.implicationEntries && <ImplicationTable labelMap = {this.state.labelMap} labels = {this.props.labels} entries = {this.state.implicationEntries} />} />
                <Details summary = {'Merger Diagram For Compatibles'} 
                content = {this.state.implicationEntries && <MergerDiagram labelMap = {this.state.labelMap} entries = {this.state.implicationEntries} stateLabels = {this.props.labels} />} />
                <Details summary = {'Merger Diagram For Incompatibles'} 
                content = {this.state.implicationEntries && <MergerDiagram labelMap = {this.state.labelMap} inCompatibles={true} entries = {this.state.implicationEntries} stateLabels = {this.props.labels} />}/>
                <Details summary = {'Maximal Compatibles'} 
                content =  {this.state.maximalCompatibles && this.state.maximalCompatibles.map((arr, index) =>{
                                return(
                                    <div key={index}>
                                        {
                                            arr.map((s, i)=>{
                                                let t = useLabelMap(s, this.state.labelMap);
                                                if(arr.length === 1){
                                                    return '{ ' + t + ' }'
                                                }
                                                if(i === 0){
                                                    return '{ ' + t + ', ';
                                                }
                                                else if(i === arr.length - 1){
                                                    return t + ' }';
                                                }
                                                return t + ', '
                                            })
                                        }
                                    </div>
                                )
                            })}/>
                
                <Details summary = {'Maximal Incompatibles'} 
                content =  {this.state.maximalIncompatibles && this.state.maximalIncompatibles.map((arr, index) =>{
                                return(
                                    <div key={index}>
                                        {
                                            arr.map((s, i)=>{
                                                let t = useLabelMap(s, this.state.labelMap);
                                                if(arr.length === 1){
                                                    return '{ ' + t + ' }'
                                                }
                                                if(i === 0){
                                                    return '{ ' + t + ', ';
                                                }
                                                else if(i === arr.length - 1){
                                                    return t + ' }';
                                                }
                                                return t + ', '
                                            })
                                        }
                                    </div>
                                )
                            })}/>
                
                <Details summary = {'Closure Table'}
                content = {
                    this.state.maximalCompatibles && this.props.nextStateMap &&
                    <ClosureTable circuitMode = {this.props.circuitMode} labelMap = {this.state.labelMap} nextStateMap = {this.props.nextStateMap} maximalCompatibles = {this.state.maximalCompatibles} />
                }
                />

                <Details summary = {'Reduced States'}
                content = {this.state.compatibles && this.state.newLabels && <ReducedStates setReduceLabelMap = {this.setReducedLabelMap} labelMap = {this.state.labelMap} labels = {this.state.newLabels} compatibles = {this.state.compatibles} />}
                />

                <Details summary = {'Reduced State Table'} 
                content = {this.state.newLabels && this.state.reducedNextStateMap && <StateTable circuitMode = {this.props.circuitMode} labelMap = {this.state.reducedLabelMap}   nextStateMap = {this.state.reducedNextStateMap} stateLabels = {this.state.newLabels}/>} />
                

                <Details summary = {'State Assignment '} 
                content = {this.state.newLabels && <StateAssignment changeBinRep
                = {this.onBinRepChange} labelMap = {this.state.reducedLabelMap} binRep = {this.state.binRep} stateLabels = {this.state.newLabels}  />}/>
                
                <Details summary = {'Transition Table '} 
                content = {this.state.newLabels && this.state.reducedNextStateMap && <StateTable circuitMode = {this.props.circuitMode} nextStateMap = {this.state.reducedNextStateMap} labelMap = {this.state.binRep} stateLabels = {this.state.newLabels}/>}/>
                
                <Details summary = {'Excitation Table'} 
                content = {this.state.newLabels && this.state.excitations && <ExcitaitonTable onLatchChange = {this.onLatchChange} latch = {this.state.latch} circuitMode = {this.props.circuitMode}  excitations = {this.state.excitations} stateLabels = {this.state.newLabels} binRep = {this.state.binRep} latchMap = {JKMap} />}/>
                
                
                <Details summary = {'KMaps'} 
                content = {this.state.kMaps &&
                    this.state.kMaps.map((k, index)=>{
                        let r = simplifyFunction(this.state.truthTables![index], this.props.circuitMode,this.props.nextStateMap!.numberOfInputVar);
                        console.log(r);
                        // let s = '';
                        // r.selectedPIs.forEach(e=> s+= getLiteral(e.comb, truthTables![index].vars) + ' + ' );
                    // s = s.slice(0, s.length - 3);
                        // if(s == '')
                        //     s = '0'
                        let key = 0;
                        return(
                            <div key = {k.functionName} className={styles.functionBlockContainer}>
                                <Details 
                                summary={k.functionName.split('').map(c => Number.isInteger(parseInt(c)) ? (<sub key={key++}>{c}</sub>) : c)}
                                content = {
                                    <div className = {styles.functionBlock}> 
                                        <KMap implicants = {r} key = {key++} kMap = {k} />
                                        <div>
                                            <FuncionEquation circuitMode = {this.props.circuitMode} numberOfInputs = {this.props.nextStateMap!.numberOfInputVar} functionName = {k.functionName} r = {r} vars = {this.state.truthTables![index].vars}  />
                                            {/* <div> {k.functionName.split('').map(c => Number.isInteger(parseInt(c)) ? (<sub key={key++}>{c}</sub>) : c)} = {s.split('').map(c => Number.isInteger(Number.parseInt(c)) ? <sub key={key++}>{c}</sub> : c  )} </div> */}
                                            <PrimeImplicants circuitMode = {this.props.circuitMode} 
                                            numberOfInputs = {this.props.nextStateMap!.numberOfInputVar} vars = {this.state.truthTables![index].vars} r = {r} />
                                        </div>
                                    </div>
                                }
                                />
                            </div>
                        )
                    })
                }/>
                
                <div className={styles.backButtonContainer}>
                    <button onClick = {()=> this.props.changeSynthesis(false)}> back to diagram </button>
                </div>
            </div>
        )
    }
}

const Details : React.FC<{
    summary : React.ReactNode,
    content : React.ReactNode
}> = (props)=>{
    return(
        <details>
            <summary> {props.summary} </summary>
            {props.content}
        </details>
    )
}

export default Design;

let nextStateMap2 : nextStateMap = {
    nextStateMap:{
        ['A'] : {
            '0' : {
                output : '0',
                state : 'E'
            },
            '1' : {
                output : '0',
                state : 'D'
            }
        },
        ['B'] : {
            '0' : {
                output : '1',
                state : 'A'
            },
            '1' : {
                output : '0',
                state : 'F'
            }
        },
        ['C'] : {
            '0' : {
                output : '0',
                state : 'C'
            },
            '1' : {
                output : '1',
                state : 'A'
            }
        },
        ['D'] : {
            '0' : {
                output : '0',
                state : 'B'
            },
            '1' : {
                output : '0',
                state : 'A'
            }
        },
        ['E'] : {
            '0' : {
                output : '1',
                state : 'D'
            },
            '1' : {
                output : '0',
                state : 'C'
            }
        },
        ['F'] : {
            '0' : {
                output : '0',
                state : 'C'
            },
            '1' : {
                output : '1',
                state : 'D'
            }
        },
        ['G'] : {
            '0' : {
                output : '1',
                state : 'H'
            },
            '1' : {
                output : '1',
                state : 'G'
            }
        },
        ['H'] : {
            '0' : {
                output : '1',
                state : 'C'
            },
            '1' : {
                output : '1',
                state : 'B'
            }
        }
    },
    numberOfInputVar : 1,
    numberOfOutputVar : 1
    
}

let nextStateMap3 : nextStateMap = {
    nextStateMap : {
        ['A'] : {
            '00' : {
                output : '0',
                state : 'D'
            },
            '01' : {
                output : '0',
                state : 'D'
            },
            '11' : {
                output : '0',
                state : 'F'
            },
            '10' : {
                output : '0',
                state : 'A'
            }
        },
        ['B'] : {
            '00' : {
                output : '1',
                state : 'C'
            },
            '01' : {
                output : '0',
                state : 'D'
            },
            '11' : {
                output : '1',
                state : 'E'
            },
            '10' : {
                output : '0',
                state : 'F'
            }
        },
        ['C'] : {
            '00' : {
                output : '1',
                state : 'C'
            },
            '01' : {
                output : '0',
                state : 'D'
            },
            '11' : {
                output : '1',
                state : 'E'
            },
            '10' : {
                output : '0',
                state : 'A'
            }
        },
        ['D'] : {
            '00' : {
                output : '0',
                state : 'D'
            },
            '01' : {
                output : '0',
                state : 'B'
            },
            '11' : {
                output : '0',
                state : 'A'
            },
            '10' : {
                output : '0',
                state : 'F'
            }
        },
        ['E'] : {
            '00' : {
                output : '1',
                state : 'C'
            },
            '01' : {
                output : '0',
                state : 'F'
            },
            '11' : {
                output : '1',
                state : 'E'
            },
            '10' : {
                output : '0',
                state : 'A'
            }
        },
        ['F'] : {
            '00' : {
                output : '0',
                state : 'D'
            },
            '01' : {
                output : '0',
                state : 'D'
            },
            '11' : {
                output : '0',
                state : 'A'
            },
            '10' : {
                output : '0',
                state : 'F'
            }
        },
        ['G'] : {
            '00' : {
                output : '0',
                state : 'G'
            },
            '01' : {
                output : '0',
                state : 'G'
            },
            '11' : {
                output : '0',
                state : 'A'
            },
            '10' : {
                output : '0',
                state : 'A'
            }
        },
        ['H'] : {
            '00' : {
                output : '1',
                state : 'B'
            },
            '01' : {
                output : '0',
                state : 'D'
            },
            '11' : {
                output : '1',
                state : 'E'
            },
            '10' : {
                output : '0',
                state : 'A'
            }
        }
    },
    numberOfInputVar : 2,
    numberOfOutputVar : 1
    
}

let nextStateMap4 : nextStateMap = {
    nextStateMap:{
        ['A'] : {
            '0' : {
                output : 'd',
                state : 'A'
            },
            '1' : {
                output : '1',
                state : 'C'
            }
        },
        ['B'] : {
            '0' : {
                output : 'd',
                state : 'B'
            },
            '1' : {
                output : 'd',
                state : 'A'
            }
        },
        ['C'] : {
            '0' : {
                output : 'd',
                state : 'G'
            },
            '1' : {
                output : '0',
                state : 'E'
            }
        },
        ['D'] : {
            '0' : {
                output : '1',
                state : 'C'
            },
            '1' : {
                output : 'd',
                state : 'C'
            }
        },
        ['E'] : {
            '0' : {
                output : '1',
                state : 'A'
            },
            '1' : {
                output : 'd',
                state : 'C'
            }
        },
        ['F'] : {
            '0' : {
                output : 'd',
                state : 'D'
            },
            '1' : {
                output : 'd',
                state : 'A'
            }
        },
        ['G'] : {
            '0' : {
                output : 'd',
                state : 'G'
            },
            '1' : {
                output : 'd',
                state : 'G'
            }
        },
        ['H'] : {
            '0' : {
                output : 'd',
                state : 'H'
            },
            '1' : {
                output : 'd',
                state : 'D'
            }
        }
    },
    numberOfInputVar : 1,
    numberOfOutputVar : 1
    
}

let nextStateMap5 : nextStateMap = {
    nextStateMap:{
        ['A'] : {
            '0' : {
                output : 'd',
                state : 'D'
            },
            '1' : {
                output : 'd',
                state : 'A'
            }
        },
        ['B'] : {
            '0' : {
                output : '0',
                state : 'E'
            },
            '1' : {
                output : 'd',
                state : 'A'
            }
        },
        ['C'] : {
            '0' : {
                output : '0',
                state : 'D'
            },
            '1' : {
                output : 'd',
                state : 'B'
            }
        },
        ['D'] : {
            '0' : {
                output : 'd',
                state : 'C'
            },
            '1' : {
                output : 'd',
                state : 'C'
            }
        },
        ['E'] : {
            '0' : {
                output : '1',
                state : 'C'
            },
            '1' : {
                output : 'd',
                state : 'B'
            }
        }
    },
    numberOfInputVar : 1,
    numberOfOutputVar : 1
    
}

let nextStateMap6 : nextStateMap = {
    nextStateMap:{
        ['A'] : {
            '0' : {
                output : 'd',
                state : 'A'
            },
            '1' : {
                output : 'd',
                state : 'd'
            }
        },
        ['B'] : {
            '0' : {
                output : '1',
                state : 'C'
            },
            '1' : {
                output : '0',
                state : 'B'
            }
        },
        ['C'] : {
            '0' : {
                output : '0',
                state : 'D'
            },
            '1' : {
                output : '1',
                state : 'd'
            }
        },
        ['D'] : {
            '0' : {
                output : 'd',
                state : 'd'
            },
            '1' : {
                output : 'd',
                state : 'B'
            }
        },
        ['E'] : {
            '0' : {
                output : '0',
                state : 'A'
            },
            '1' : {
                output : '1',
                state : 'C'
            }
        }
    },
    numberOfInputVar : 1,
    numberOfOutputVar : 1
    
}
