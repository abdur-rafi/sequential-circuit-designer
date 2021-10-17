
import { StateNode } from "../state-diagram/state-diagram-interfaces";
import { excitationInterface, nextStateMap, truthTable, kMap, tabulationGroupItem, implicationEntryMap, stringToStringMap, simplifyFunctionReutnType, circuitMode } from "./interfaces";

function nextChar(c : string) {
    return String.fromCharCode(c.charCodeAt(0) + 1);
}

export class StringIdGenerator{
    units : string[] = []
    curr : string[]
    unitIndex : number
    changingIndex : number
    constructor(units = [] , useDot = false){
        if(units.length !== 0){
            this.units = units;
        }
        else{
            let str = 'A';
            for(let i = 0; i < 26; ++i){
                let temp = str;
                if(useDot) temp += "'"
                this.units.push(temp);
                str = nextChar(str);
            }
        }
        this.curr = [this.units[0]];
        this.unitIndex = 0;
        this.changingIndex = 0; 
    }
    next(){
        let t = '';
        for(let i = 0; i < this.curr.length; ++i){
            t += this.curr[i];
        }
        this._increment();
        return t;
        
    }

    _increment(){
        if(this.unitIndex < this.units.length - 1){
            let id = this.curr.length - 1;
            this.curr[id] = this.units[this.unitIndex + 1];
            this.unitIndex++;
        }
        else{
            this.unitIndex = 0;
            for(let i = this.changingIndex + 1; i < this.curr.length; ++i){
                this.curr[i] = this.units[0];
            }
            let id = this.units.indexOf(this.curr[this.changingIndex]);
            if(id === this.units.length - 1){
                if(this.changingIndex === 0){
                    this.curr.splice(0, 0, this.units[0]);
                    this.curr[1] = this.units[0];
                    this.changingIndex = this.curr.length - 2;
                    return;
                }
                this.changingIndex--;
                id = 0;
                
            }
            this.curr[this.changingIndex] = this.units[id + 1];
            
        }
    }

}

export function getRequiredBitForStates(noOfStateNodes : number){
    let c = 0;
    let n = noOfStateNodes;
    if(n === 1) return 1;
    while((1 << c) < n){
        c++;
    }
    return c;
}

export function getBinRepresentation(stateLabels : string[]) : stringToStringMap{
    let n = stateLabels.length;
    let c = getRequiredBitForStates(n);
    let m : stringToStringMap = {} ;
    for(let i = 0; i < n; ++i){
        let curr = i.toString(2);
        while(curr.length < c){
            curr = '0' + curr;
        }
        m[stateLabels[i]] = curr;
    }
    let d = '';
    for(let i = 0; i < c; ++i) d+= 'd';
    m['d'] = d;
    return m;
}

export function getInputCombination(d : number, circuitMode : circuitMode , labels? : string[]) : string[]{
    let n = Math.pow(2,d);
    let inps : string[] = []
    if(circuitMode === 'synch'){
        for(let i = 0; i < n; ++i){
            let curr = i.toString(2);
            while(curr.length < d){
                curr = '0' + curr;
            }
            inps.push(curr);

        }
    }
    else if(circuitMode === 'pulse'){
        for(let i = 0; i < d; ++i){
            inps.push('x' + i);
        }
    }
    return inps;
}

export async function  getNextStateMap(stateNodes : StateNode[], internalLabel : stringToStringMap, numberOfInpVars : number, numberOfOutputVar : number, circuitMode : circuitMode) : Promise<nextStateMap>{
    let map : nextStateMap = {
        nextStateMap : {},
        numberOfOutputVar : numberOfOutputVar,
        numberOfInputVar : numberOfInpVars
    };

    let inpComb = getInputCombination(numberOfInpVars, circuitMode);
    stateNodes.forEach(s=>{
        map.nextStateMap[internalLabel[s.label]] = {}
        inpComb.forEach(comb=>{

            let from = s.ioNodes.filter(ioNode => ioNode.inputComb === comb)[0];
            let nxtState = '';
            if(from.edges.length === 0){
                nxtState = 'd';
            }
            else{
                nxtState = internalLabel[from.edges[0].to.originNode.label];
            }

            map.nextStateMap[internalLabel[s.label]][comb] = {
                state : nxtState,
                output : from.output
            }
        })
    })
    return map;
}

export function getLabels(n : number, t : string): string[]{
    let vars : string[] = []
    for(let i = 0; i < n; ++i){
        let s = t + i;
        vars.push(s);
    }

    return vars;
}

export async function getExcitationsFromNextStateMap(stateLabels : string[], nextStateMap : nextStateMap, binMap : stringToStringMap, latchMap : {[key: string]: string} , numberOfLatchVars : number, circuitMode : circuitMode) : Promise<excitationInterface[]>{
    const max = (n : number, n2 : number) : number=>{
        if(n > n2) return n;
        return n2;
    }
    let excitations : excitationInterface[] = [];
    let numberOfStateBits = getRequiredBitForStates(stateLabels.length);
    let numberOfInputVar = nextStateMap.numberOfInputVar;
    let numberOfOutputVars = nextStateMap.numberOfOutputVar;
    let inpComb = getInputCombination(numberOfInputVar, circuitMode);
    let mx = max(numberOfOutputVars, numberOfStateBits);
    for(let i = 0; i < mx; ++i){
        let sIndex = i;
        let oIndex = i;
        if(i < numberOfStateBits){
            excitations.push({map : {}, 
                dims : {
                    row : numberOfStateBits,
                    col : numberOfInputVar
                },
                index : i,
                rowLabels : getLabels(numberOfStateBits, 'y'),
                colLabels : getLabels(numberOfInputVar, 'x'),
                type : 'state',
                entryLength : numberOfLatchVars
            });
            sIndex = excitations.length - 1;
        }
        if(i < numberOfOutputVars){
            excitations.push({map : {}, 
                dims : {
                    row : numberOfStateBits,
                    col : numberOfInputVar
                },
                index : i,
                rowLabels : getLabels(numberOfStateBits, 'y'),
                colLabels : getLabels(numberOfInputVar, 'x'),
                type : 'output',
                entryLength : 1
            });
            oIndex = excitations.length - 1;
        }
        stateLabels.forEach(currStateLabel =>{
            // let currStateLabel = s;
            let currBin = useLabelMap(currStateLabel, binMap);
            if(i < numberOfStateBits){
                excitations[sIndex].map[currBin!] = {};
            }
            if(i < numberOfOutputVars)
                excitations[oIndex].map[currBin!] = {};
            inpComb.forEach(comb=>{
                // let from = s.ioNodes.filter(ioNode => ioNode.inputComb === comb)[0];
                if(i < numberOfOutputVars)
                    excitations[oIndex].map[currBin!][comb] = nextStateMap.nextStateMap[currStateLabel][comb].output[i];
                if(i < numberOfStateBits){
                    let nxtStateLabel = nextStateMap.nextStateMap[currStateLabel][comb].state;
                    let nextBin = useLabelMap(nxtStateLabel, binMap);
                    if(!nextBin) return;
                    excitations[sIndex].map[currBin!][comb] = latchMap[ currBin![i] + nextBin[i] ];
                    
                }
            })
        })
    }
    return excitations;
}


export async function truthTablesFromExcitation(excitation : excitationInterface, functionLabels : string, circuitMode : circuitMode) : Promise<truthTable[]>{
    let numberOfVars = excitation.dims.row + excitation.dims.col;
    let inpCombs : string[] = [];
    if(circuitMode === 'synch'){
        inpCombs = getInputCombination(numberOfVars, circuitMode);
    }
    else{
        let stateCombs = getInputCombination(excitation.dims.row, 'synch');
        let pulseCombs = getInputCombination(excitation.dims.col, circuitMode);
        stateCombs.forEach(st =>{
            pulseCombs.forEach(p => inpCombs.push(st + p))
        })
    }
    let tTable : truthTable[] = [];
    let fDim = excitation.dims.row;
    // if(pair) tTable.push({table : {}, dims : numberOfVars, functionName : '', vars : excitation.colLabels + excitation.rowLabels});
    for(let i = 0; i < excitation.entryLength; ++i){
        tTable.push({table : {}, dims : numberOfVars,functionName : '', vars : [...excitation.rowLabels ,...excitation.colLabels]});
    }
    inpCombs.forEach(comb => {
        let f = comb.slice(0, fDim);
        let s = comb.slice(fDim);
        let r;
        try{

            r = excitation.map[f][s];
        }
        catch(e){

        }
        for(let i = 0; i < excitation.entryLength; ++i){
            tTable[i].table[comb] = r ? r[i] : 'd';
            tTable[i].functionName = functionLabels[i] + excitation.index;
        }
    })
    return tTable;
    
}

export async function generateKMap(truthTable : truthTable, circuitMode : circuitMode, numberOfInput? : number) : Promise<kMap[]>{
    if(circuitMode === 'pulse'){
        let stateDim = truthTable.dims - numberOfInput!;
        let numberOfinps = numberOfInput!;
        let tablesForPulses : {
            [pulse : string] : truthTable
        } = {}
        let pulseComb = getInputCombination(numberOfinps, 'pulse');
        let stateComb = getInputCombination(stateDim,'synch');
        let kmaps : kMap[] = []
        let kmap : kMap = {
            map : {},
            dims : {
                pulse : -1,
                rem : -1,
                col : -1,
                row : -1
            },
            functionName : truthTable.functionName,
            pulseMode : true,
            vars : {
                pulse : [],
                rem : [],
                col : [],
                row : []
            }
        }
        pulseComb.forEach(async p =>{
            let tr : truthTable = {
                dims : stateDim,
                functionName : truthTable.functionName + p,
                table : {},
                vars : truthTable.vars.slice(0,stateDim)
            }
            stateComb.forEach(s =>{
                tr.table[s] = truthTable.table[s + p]
            })
            // tablesForPulses[p] = tr;
            let mp = await generateKMap(tr, 'synch');
            kmap.dims = mp[0].dims;
            kmap.dims.pulse = numberOfinps;
            kmap.vars = mp[0].vars;
            kmap.vars.pulse = pulseComb;
            kmap.map[p] = mp[0].map[''];
            mp[0].pulseMode = true;
        })

        return [kmap];
        
    }
    let numberOfTotalVars = truthTable.dims;
    if(numberOfTotalVars < 5){
        let row = Math.floor(numberOfTotalVars / 2);
        let col = numberOfTotalVars - row;
        let rowComb = getInputCombination(row, 'synch');
        let colComb = getInputCombination(col, 'synch');
        let kMap : kMap = {
            map : {},
            dims : {
                pulse : 0,
                rem : 0,
                row : row,
                col : col
            },
            functionName : truthTable.functionName,
            vars : {
                pulse : [],
                rem : [],
                row : truthTable.vars.slice(0, row),
                col : truthTable.vars.slice(row)
            },
            pulseMode : false
        };
        kMap.map[''] = {}
        kMap.map[''][''] = {}
        
        rowComb.forEach(rcomb=>{
            kMap.map[''][''][rcomb] = {}
            colComb.forEach(ccomb=>{
                kMap.map[''][''][rcomb][ccomb] = truthTable.table[rcomb + ccomb];
            })
        })
        return [kMap];
    }
    else{
        
        let rem = numberOfTotalVars - 4;
        let remCombs = getInputCombination(rem, 'synch');
        let comb = getInputCombination(4, 'synch');

        let kMap : kMap = {
            map : {},
            dims : {
                pulse : 0,
                rem : rem,
                row : 2,
                col : 2
            },
            functionName : truthTable.functionName,
            vars : {
                pulse : [],
                rem : truthTable.vars.slice(0, rem),
                row : truthTable.vars.slice(rem, rem + 2),
                col : truthTable.vars.slice(-2)
            },
            pulseMode : false
        };
        kMap.map[''] = {}

        remCombs.forEach(async remComb=>{
            let tTable : truthTable = {
                table : {},
                dims : 4,
                functionName : truthTable.functionName,
                vars : truthTable.vars.slice(-4)
            };
            comb.forEach(c=>{
                tTable.table[c] = truthTable.table[remComb + c];
            })
            let temp = await generateKMap(tTable, 'synch');
            kMap.map[''][remComb] = temp[0].map[''][''];
        })
        return [kMap];
    }
}

export function generateGreyCode(nBit : number) : string[]{
    if(nBit < 1) return [];
    if(nBit == 1){
        return ['0', '1']
    }
    let pr = generateGreyCode(nBit - 1);
    let prRev = [...pr].reverse();
    pr = pr.map(p=>'0'+p);
    prRev = prRev.map(p=>'1' + p);
    return [...pr, ...prRev];
}


export function count1(s : string) : number{
    let c = 0;
    for(let i = 0; i < s.length; ++i){
        if(s[i] == '1') c++;
    }
    return c;
}

export function countDifference(s1 : string, s2 : string): number{
    let diff = 0;
    for(let i = 0; i < s1.length; ++i){
        if(s1[i] != s2[i])
            ++diff;
    }
    return diff;
}

export function mergeComb(s1 : string, s2 : string) : string{
    let r = '';
    for(let i = 0; i < s1.length; ++i){
        if(s1[i] !== s2[i]){
            r += '_'
        }
        else r += s1[i];
    }
    return r;
}

export function simplifyFunction(truthTable : truthTable,circuitMode : circuitMode, numberOfInput : number, returnSteps ? : boolean) : simplifyFunctionReutnType   
{

    if(circuitMode === 'pulse'){
        let inpComb = getInputCombination(numberOfInput,'pulse');
        let r : simplifyFunctionReutnType = {
        }
        let stateComb = getInputCombination(truthTable.dims - numberOfInput, 'synch');
        inpComb.forEach(p =>{
            let tr :truthTable = {
                dims : truthTable.dims - numberOfInput,
                table : {},
                functionName : truthTable.functionName,
                vars : truthTable.vars.slice(0, truthTable.dims - numberOfInput)
            }

            stateComb.forEach(s=>tr.table[s] = truthTable.table[s + p])

            r[p] = simplifyFunction(tr,'synch',truthTable.dims - 1,true)[''];
        })

        return r;
    }
    let inpComb = getInputCombination(truthTable.dims, circuitMode);

    let nonZeroinpComb = inpComb.filter(comb=>truthTable.table[comb] != '0');
    let groups : tabulationGroupItem[][] = [];
    let rGroups : tabulationGroupItem[][][] = [groups];
    for(let i = 0; i <= truthTable.dims; ++i){
        let item : tabulationGroupItem[] = [];
        for(let j = 0; j < nonZeroinpComb.length; ++j){
            let comb = nonZeroinpComb[j];
            if(count1(comb) === i){
                item.push({
                    comb : comb,
                    taken : false,
                    minterms : new Set<string>().add(comb)
                })
            }
        }
        groups.push(item);
    }
    // console.log(groups);
    let notTaken : tabulationGroupItem[] = [];
    let notTakenSet : Set<string>  = new Set<string>();
    // console.log(groups);
    for(let i = 0; i <= truthTable.dims; ++i){
        let nGroups : tabulationGroupItem[][] = [];
        let changed = false;
        for(let j = 0; j + 1 < groups.length; ++j){
            let item : tabulationGroupItem[] = [];
            let itemSet : Set<string> = new Set<string>();
            let curr = groups[j];
            let next = groups[j + 1];
            curr.forEach(c =>{
                next.forEach(n =>{
                    if(countDifference(c.comb, n.comb) === 1){
                        let merged = mergeComb(c.comb, n.comb);
                        if(!itemSet.has(merged)){
                            changed = true;
                            item.push({
                                comb : mergeComb(c.comb, n.comb),
                                minterms : new Set([...c.minterms, ...n.minterms]),
                                taken : false
                            })
                            itemSet.add(mergeComb(c.comb, n.comb));
                        }
                        c.taken = true;
                        n.taken = true;
                    }
                })
            })
            nGroups.push(item);
            
        }
        groups.forEach(g=>{
            g.forEach(i =>{
                if(!i.taken && !notTakenSet.has(i.comb)){
                    notTaken.push(i);
                    notTakenSet.add(i.comb);
                }
            })
        })
        if(changed){
            rGroups.push(nGroups);
        }
        groups = nGroups;
    }

    let coveringMap : Map<string, tabulationGroupItem[]> = new Map<string, tabulationGroupItem[]>();
    let oneMinterms = inpComb.filter(comb => truthTable.table[comb] == '1');
    // console.log(oneMinterms);
    oneMinterms.forEach(m=>coveringMap.set(m, []))
    notTaken.reverse();
    notTaken.forEach(t=>{
        t.minterms.forEach(minterm => {

            if(coveringMap.has(minterm)){
                let arr = coveringMap.get(minterm);
                if(arr){
                    arr.push(t);
                    coveringMap.set(minterm, arr);
                }
            }
        })
    })
    let epi : tabulationGroupItem[] = []
    let epiSet : Set<string> = new Set<string>();
    for(let i = 0; i < oneMinterms.length; ++i){
        let arr = coveringMap.get(oneMinterms[i]);
        if(arr){
            if(arr.length === 1){
                if(!epiSet.has(arr[0].comb)){
                    epi.push(arr[0]);
                    epiSet.add(arr[0].comb);
                    arr[0].minterms.forEach(m => coveringMap.delete(m));
                }
            }
        }
    }
    let remPIs : tabulationGroupItem[] = [];
    // console.log(epi);
    notTaken.forEach(nt =>{
        if(epiSet.has(nt.comb)) return;
        let f  = false;
        nt.minterms.forEach(mt=>{
            if(coveringMap.has(mt)){
                if(!f){
                    remPIs.push(nt);
                    f = true;
                }
                coveringMap.delete(mt);
            }
        })
    })

    // console.log(epi, remPIs);

    return{
        '' :{
            EPIs : epi,
            PIs : notTaken,
            selectedPIs : [...epi, ...remPIs ],
            groupsPerStep : returnSteps ? rGroups : undefined
        }
    }
    
    // console.log(coveringMap);

    // console.log(notTaken);
}

export function getLiteral(comb : string, vars : string[], circuitMode : circuitMode): string{
    let r = '';
    for(let i = 0; i < comb.length; ++i){
        if(comb[i] == '_')
            continue;
        else if(comb[i] == '0'){
            r += vars.slice(i, i + 1) + "'";
        }
        else r += vars.slice(i, i + 1);
    }
    if(r == '' && circuitMode === 'synch') return '1';
    return r;
}

export async function stateMinimization(stateLabels : string[], nextStateMap : nextStateMap, circuitMode : circuitMode):Promise<implicationEntryMap>{
    let separator = ' ';
    let numberOfInputVars = nextStateMap.numberOfInputVar;
    let inpComb = getInputCombination(numberOfInputVars,circuitMode);

    const combineStateLabels = (l1 : string, l2 : string) : string =>{
        if(l1 < l2) return l1 + separator + l2;
        return l2 + separator + l1; 
    }
    const dependency = (state1 : string, state2 : string) : string[] =>{
        let arr : string[] = [];
        inpComb.forEach(comb=>{
            let nx1 = nextStateMap.nextStateMap[state1][comb].state;
            let nx2 =  nextStateMap.nextStateMap[state2][comb].state;
            if(nx1 === nx2) return;
            if(nx1 === 'd' || nx2 === 'd') return;
            if(combineStateLabels(nx1, nx2) === combineStateLabels(state1, state2)) return;
            if(arr.indexOf(combineStateLabels(nx1, nx2)) != -1) return;
            arr.push(combineStateLabels(nx1, nx2));
        })
        let currComb = combineStateLabels(state1, state2);
        arr = arr.filter(c => c !== currComb);
        return arr;
    }
    const doesOutputMatch = (s1 : string, s2 : string) : boolean =>{
        for(let i = 0; i < inpComb.length; ++i){
            let comb = inpComb[i];
            let out1 = nextStateMap.nextStateMap[s1][comb].output;
            let out2 = nextStateMap.nextStateMap[s2][comb].output;
            for(let i = 0; i < out1.length; ++i){
                if(out1[i] === 'd' || out2[i] === 'd') continue;
                if(out1[i] !== out2[i]) return false;
            }
            // if(nextStateMap.nextStateMap[s1][comb].output !== nextStateMap.nextStateMap[s2][comb].output) return false;
        }
        return true;
    } 

    

    let compatibles : Set<string> = new Set<string>();
    let notCompatibles : Set<string> = new Set<string>();

    let dependants : Map<string, string[]> = new Map<string, string[]>();

    const dfs = (s : string)=>{
        notCompatibles.add(s);
        let arr = dependants.get(s);
        if(!arr) return;
        dependants.delete(s);
        arr.forEach(s =>{
            // notCompatibles.add(s);
            dfs(s);
        })

    }

    let states = stateLabels;
    for(let i = 0; i < states.length; ++i){
        for(let j = i + 1; j < states.length; ++j){
            let combined = combineStateLabels(states[i], states[j]);
            if(!doesOutputMatch(states[i], states[j])){
                dfs(combined);
                continue;
            }
            let dependentOn = dependency(states[i], states[j]);
            if(dependentOn.length === 0){
                compatibles.add(combined);
            }
            else{
                if(dependentOn.some(s=>notCompatibles.has(s))){
                    dfs(combined);
                    // notCompatibles.add(combined);
                    continue;
                }
                dependentOn.forEach(d=>{
                    let arr = dependants.get(d);
                    if(!arr){
                        arr = []
                    }
                    dependants.set(d, [combined, ...arr])
                })
            }
        }
    } 

    let implicationEntries : implicationEntryMap = {}

    notCompatibles.forEach(s =>{
        let arr = s.split(separator);
        let s1 = arr[0];
        let s2  = arr[1];
        if(!implicationEntries[s1]){
            implicationEntries[s1] = {}
        }
        implicationEntries[s1][s2] = {
            isCompatible : false,
            dependencies : []
        }
    })

    for(let i = 0; i < states.length; ++i){
        for(let j = i + 1 ; j < states.length;++j){
            if(!implicationEntries[states[i]]){
                implicationEntries[states[i]] = {};
                implicationEntries[states[i]][states[j]] = {
                    dependencies : dependency(states[i], states[j]),
                    isCompatible : true
                };
            }
            else if(!implicationEntries[states[i]][states[j]]){
                implicationEntries[states[i]][states[j]] = {
                    dependencies : dependency(states[i], states[j]),
                    isCompatible : true
                }
            }
        }
    }

    // console.log('comp', compatibles);
    // console.log('ncomp', notCompatibles);

    return implicationEntries;
}

function getComibations(n : number, upto : number) : {
    [len : number] : string[]
}{
    let combinations : {
        [len : number] : string[]
    } = {}
    let mx = (1 << n);
    for(let i = 1; i < mx; ++ i){
        let curr = i.toString(2);
        let count = count1(curr);
        let temp = '';
        for(let j = 0; j < n - curr.length; ++j)
            temp += '0';
        curr = temp + curr;
        if(count <= upto){
            if(!combinations[count]) combinations[count] = []
            combinations[count].push(curr);
        }
    }
    return combinations;
}

export async function getMaximals( labels : string[], entries : implicationEntryMap, inCompatibles? : boolean) : Promise<string[][]>{

    let n = labels.length;
    let labelToIndex : {
        [label :string] : number
    } = {}
    labels.forEach((l, i)=>labelToIndex[l] = i);

    const createAdjacencyList = () : number[][]=>{
        let adj : number[][] = []
        
        for(let i = 0; i < n; ++i ) adj.push([]);
        
        for(let i = 0; i < n; ++i){
            let s1 = labels[i];
            for(let j = i + 1; j < n; ++j){
                let s2 = labels[j];
                if( (!inCompatibles && entries[s1][s2].isCompatible) || (inCompatibles && !entries[s1][s2].isCompatible)){
                    let i1 = labelToIndex[s1];
                    let i2 = labelToIndex[s2];
                    adj[i1].push(i2);
                    adj[i2].push(i1);
                }
            }
        }
        for(let i = 0; i < n; ++i){
            adj[i].sort((a, b) => a - b);
        }

        return adj;
    }

    const getUpperBound = (adj : number[][]) : number=>{
        let freq = new Array(n);
        for(let i = 0; i < n; ++i) freq[i] = 0;
        adj.forEach(a => freq[a.length]++);
        let s = 0;
        for(let i = n - 1; i > -1; --i){
            freq[i] += s;
            s += freq[i];
            if(freq[i] > i) return i + 1;
        }
        console.log(freq);
        return 0;
    }

    

    const getCombStates = (comb : string) : number[]=>{
        let s = []
        let n = comb.length;
        for(let i = 0; i < n; ++i){
            if(comb[i] === '1'){
                s.push(i);
            }
        }
        return s;
    }

    const check = (stateIndexes : number[])=>{
        let n = stateIndexes.length;
        for(let i = 0; i < n; ++i){
            let s1 = labels[stateIndexes[i]];
            for(let j = i + 1; j < n; ++j){
                let s2 = labels[stateIndexes[j]];
                // if(s1 === s2) continue;
                if((!inCompatibles && !entries[s1][s2].isCompatible) || (inCompatibles && entries[s1][s2].isCompatible)) return false;
            }
        }
        return true;
    }

    const doesContain = (inside : number[], elem : number[]) : boolean => {
        let n = inside.length;
        let j = 0;
        for(let i = 0; i < n; ++i){
            if(j < elem.length && inside[i] == elem[j])
                j++;
            
        }
        return j == elem.length;
    }


    let adj = createAdjacencyList();
    let upperBound = getUpperBound(adj);
    let maximals : number[][] = [];
    // console.log(adj);
    // console.log(upperBound);
    let combs = getComibations(n , upperBound);
    // console.log(combs);
    for(let i = upperBound; i > 0; --i){
        combs[i].reverse();
        combs[i].forEach(comb=>{
            let indexes = getCombStates(comb);
            if(maximals.some(m => doesContain(m, indexes)))
                return;
            // let str = convertToString(indexes);
            // if(maximalCompatibles.includes(str)) return;
            if(check(indexes)){
                maximals.push(indexes);
                // maximalCompatibles += convertToString(indexes);

            }
        })
    }


    // console.log(combs);
    // console.log('compatibles', maximals);
    let maximalLabels : string[][] = [];
    maximals.forEach(indexes =>{
        let temp : string[] = indexes.map(i => labels[i]);
        maximalLabels.push(temp);
    })
    return maximalLabels;

}


export async function getMinimumClosure(labels : string[], maximalCompatibles : string[][], nextStateMap : nextStateMap, upperBound : number, lowerBound : number, circuitMode : circuitMode) : Promise<string[][]> {
    let inputCombinations = getInputCombination(nextStateMap.numberOfInputVar, circuitMode);
    let allChoices = getComibations(maximalCompatibles.length, upperBound);
    const indexesForParticularCombination = (comb : string) : number[]=>{
        let sets : number[] = [];
        for(let i = 0; i < comb.length; ++i){
            if(comb[i] === '1'){
                sets.push(i);
            }
        }
        return sets;
    }

    const indexesOfIndividualStates = (compatibles : string[][]) =>{
        let arr : {[state:string] : number[]} = {}
        compatibles.forEach((compatible, index) =>{
            compatible.forEach(individualState =>{
                if(!arr[individualState]){
                    arr[individualState] = []
                }
                arr[individualState].push(index);
            })
        })
        return arr;
    }

    const doesMaintainClousure = (compatibles : string[][]) =>{
        const compatiblesSets = compatibles.map(compatible =>{
            let s = new Set<string>();
            compatible.forEach(e => s.add(e));
            return s;
        })
        for(let i = 0; i < compatibles.length; ++i){
            let compatible = compatibles[i]
            for(let i = 0; i < inputCombinations.length; ++i){
                let inputCombination = inputCombinations[i];
                let curr : string[] = [];
                compatible.forEach(state =>{
                    if(nextStateMap.nextStateMap[state][inputCombination].state != 'd'){
                        curr.push(nextStateMap.nextStateMap[state][inputCombination].state);
                    }
                })
                let f = false;
                if(curr.length === 0) f = true;
                for(let i = 0; i < compatibles.length; ++i){
                    let t = true;
                    let compatible = compatiblesSets[i];
                    for(let j = 0; j < curr.length; ++j){
                        if(!compatible.has(curr[j])){
                            t = false;
                            break;
                        }
                    }
                    if(t) f = true;
                }
                if(!f) return false;

            }
        }
        return true;
    }

    const checkAllCoveringFromParicularCombiantion = (index : number, n : number, locations : {[state:string] : number[]} , current : string[][]) : string[][]=>{
        if(index < n){
            let currLocation = locations[labels[index]];
            let cn = currLocation.length;
            let upto = (1 << cn) ;
            for(let i = 1; i < upto; ++i){
                let curr = i.toString(2);
                let temp = '';
                for(let j = 0; j < cn - curr.length; ++j)
                    temp += '0';
                curr = temp + curr;
                
                let indexes = indexesForParticularCombination(curr);
                indexes.forEach(i1 =>{
                    let j = currLocation[i1];
                    current[j].push(labels[index]);
                })
                
                let r = checkAllCoveringFromParicularCombiantion(index + 1, n, locations, current);
                
                if(r.length != 0 ){
                    return r; 
                }
                indexes.forEach(i1 =>{
                    let j = currLocation[i1];
                    let index2 = current[j].indexOf(labels[index]);
                    current[j].splice(index2, 1);
                })
            }
        }
        else{
            if(doesMaintainClousure(current)){
                return current;
            }
        }    
        return []  ;  
    }

    for(let i = lowerBound; i <= upperBound; ++i){
        for(let j = 0; j < allChoices[i].length; ++j){
            let combination = allChoices[i][j];
            let indexes = indexesForParticularCombination(combination);
            let compatibles : string[][] = []
            for(let j = 0; j < indexes.length; ++j) compatibles.push(maximalCompatibles[indexes[j]]);
            let locationsOfEachState = indexesOfIndividualStates(compatibles);
            let n = labels.length;
            let c = false;
            for(let j = 0; j < n; ++j){
                if(!locationsOfEachState[labels[j]]){
                    c = true;
                    break;
                }
            }
            if(c) continue;
            let curr : string[][] = [];
            for(let k = 0; k < i; ++k) curr.push([]);
            let r = checkAllCoveringFromParicularCombiantion(0, n, locationsOfEachState,curr);

            if(r.length != 0){
                return r;
            }

        }
    }
    return [];
}

export async function getReducedNextStateMap(newLabels : string[], compatibles : string[][], nextStateMap : nextStateMap, circuitMode : circuitMode) {
    
    const inpComb = getInputCombination(nextStateMap.numberOfInputVar, circuitMode);

    

    let newMap  : nextStateMap = {
        nextStateMap : {},
        numberOfInputVar : nextStateMap.numberOfInputVar,
        numberOfOutputVar : nextStateMap.numberOfOutputVar
    }

    const getNewLabel = (nextStates : string[])=>{
        if(nextStates.length === 0) return 'd';
        let n = compatibles.length;
        for(let i = 0; i < n; ++i){
            let compatible = compatibles[i];
            let f = true;
            for(let j = 0; j < nextStates.length; ++j){
                if(compatible.indexOf(nextStates[j]) === -1){
                    f = false;
                    break;
                }
            }
            if(f){
                return newLabels[i];
            }
        }
        return '';
    }

    compatibles.forEach((compatible, index) =>{
        newMap.nextStateMap[newLabels[index]] = {};
        inpComb.forEach(inp =>{
            let nxt : string[] = [];
            let outs : string[] = []
            compatible.forEach((comb) =>{
                if(nextStateMap.nextStateMap[comb][inp].state != 'd'){
                    nxt.push(nextStateMap.nextStateMap[comb][inp].state);
                }
                outs.push(nextStateMap.nextStateMap[comb][inp].output);
            })
            let out = '';
            for(let i = 0; i < outs[0].length; ++i){
                let t = 'd';
                outs.forEach(o =>{
                    if(o[i] !== 'd') t = o[i];
                })
                out += t;
            }
            
            newMap.nextStateMap[newLabels[index]][inp] = {
                state : getNewLabel(nxt),
                output : out
            }
        })
    })

    return newMap;

}

export async function getNewLabels(n : number, useDot = true){
    
    let ids = new StringIdGenerator([], useDot);
    let newLabels : string[] = [];
    for(let i = 0; i < n; ++i)
        newLabels.push(ids.next());
    return newLabels;
}

export async function nextStateMapFromStateTalbeInput(states : string[], entries : string[][], outputs : string[][], circuitMode : circuitMode){
    let n = states.length;
    let internalLabels = await getNewLabels(n,false);
    let numberOfInputs : number = 0;
    if(circuitMode === 'synch')
        numberOfInputs = Math.log2(entries[0].length);
    else if(circuitMode === 'pulse'){
        numberOfInputs = entries[0].length;
    }
    let internalToOriginalMap : {
        [internal : string] : string
    } = {}
    internalLabels.forEach((label, index)=> internalToOriginalMap[label] = states[index]);
    let originalToInternalMap : {
        [original : string] : string
    } = {}
    states.forEach((state, index)=> originalToInternalMap[state] = internalLabels[index])
    let inpComb = getInputCombination(numberOfInputs, circuitMode);
    let nextStateMap : nextStateMap = {
        nextStateMap : {},
        numberOfInputVar : numberOfInputs,
        numberOfOutputVar : outputs[0][0].length
    }
    for(let i = 0; i < n; ++i){
        nextStateMap.nextStateMap[internalLabels[i]] = {}
        let m = entries[i].length;
        for(let j = 0; j < m; ++j){
            nextStateMap.nextStateMap[internalLabels[i]][inpComb[j]] = {
                output : outputs[i][j],
                state : entries[i][j] === 'd' ? 'd' : originalToInternalMap[entries[i][j]]
            }
        }
    }
    return { nextStateMap :  nextStateMap, internalToOriginalMap : internalToOriginalMap , internalLabels : internalLabels};
}

export function useLabelMap(label : string, labelMap : {[k : string] : string} | null | undefined ){
    if(label === 'd') return label;
    if(!labelMap) return label;
    return labelMap[label];
}

export async function truthTableFromMinterms(terms : number[], vars : string[], dontCares : number[], circuitMode : circuitMode){
    let trTable : truthTable = {
        table : {

        },
        dims : vars.length,
        functionName : '',
        vars : vars
    }
    let inpComb = getInputCombination(vars.length, circuitMode);
    
    inpComb.forEach((comb, index)=>{
        if(terms.indexOf(index) != -1){
            trTable.table[comb] = '1';
        }
        else if(dontCares.indexOf(index) != -1){
            trTable.table[comb] = 'd';
        }
        else
            trTable.table[comb] = '0';
    })

    return trTable;
}