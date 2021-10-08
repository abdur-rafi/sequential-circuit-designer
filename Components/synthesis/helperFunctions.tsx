import { StateNode } from "../state-diagram/state-diagram-interfaces";
import { excitationInterface, nextStateMap, truthTable, kMap, tabulationGroupItem, implicationEntryMap } from "./interfaces";

export function getRequiredBitForStates(noOfStateNodes : number){
    let c = 0;
    let n = noOfStateNodes;
    while(Math.pow(2, c) < n){
        c++;
    }
    return c;
}

export function getBinRepresentation(stateNodes : StateNode[]) : Map<string, string>{
    let n = stateNodes.length;
    let c = getRequiredBitForStates(n);
    let m = new Map<string, string>();
    for(let i = 0; i < n; ++i){
        let curr = i.toString(2);
        while(curr.length < c){
            curr = '0' + curr;
        }
        m.set(stateNodes[i].label,curr);
    }
    return m;
}

export function getInputCombination(d : number) : string[]{
    let n = Math.pow(2,d);
    let inps : string[] = []
    for(let i = 0; i < n; ++i){
        let curr = i.toString(2);
        while(curr.length < d){
            curr = '0' + curr;
        }
        inps.push(curr);

    }
    return inps;
}

export function getNextStateMap(stateNodes : StateNode[], numberOfInpVars : number) : nextStateMap{
    let map : nextStateMap = {};
    let inpComb = getInputCombination(numberOfInpVars);
    stateNodes.forEach(s=>{
        map[s.label] = {}
        inpComb.forEach(comb=>{
            let from = s.ioNodes.filter(ioNode => ioNode.inputComb === comb)[0];
            let to = from.edges[0].to;

            map[s.label][comb] = {
                state : to.originNode.label,
                output : from.output
            }
        })
    })
    return map;
}

export function getLabels(n : number, t : string): string{
    let s = '';
    for(let i = 0; i < n; ++i)
        s += t + i;
    return s;
}

export function getExcitations(stateNodes : StateNode[] , binMap : Map<string, string>, numberOfInputVar : number, latchMap : {[key: string]: string} , numberOfLatchVars : number, numberOfOutputVars : number ) : excitationInterface[]{
    const max = (n : number, n2 : number) : number=>{
        if(n > n2) return n;
        return n2;
    }
    
    let excitations : excitationInterface[] = [];
    let numberOfStateBits = getRequiredBitForStates(stateNodes.length);
    let inpComb = getInputCombination(numberOfInputVar);
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
        stateNodes.forEach(s =>{
            let currStateLabel = s.label;
            let currBin = binMap.get(currStateLabel);
            if(i < numberOfStateBits){
                excitations[sIndex].map[currBin!] = {};
            }
            if(i < numberOfOutputVars)
                excitations[oIndex].map[currBin!] = {};
            inpComb.forEach(comb=>{
                let from = s.ioNodes.filter(ioNode => ioNode.inputComb === comb)[0];
                if(i < numberOfOutputVars)
                    excitations[oIndex].map[currBin!][comb] = from.output;
                if(i < numberOfStateBits){
                    let nxtStateLabel = from.edges[0].to.originNode.label;
                    let nextBin = binMap.get(nxtStateLabel);
                    if(!nextBin) return;
                    excitations[sIndex].map[currBin!][comb] = latchMap[ currBin![i] + nextBin[i] ];
                    
                }
            })
        })
    }
    return excitations;
}

export function truthTablesFromExcitation(excitation : excitationInterface, numberOfVars : number, fDim : number, functionLabels : string) : truthTable[]{
    let inpCombs = getInputCombination(numberOfVars);
    let tTable : truthTable[] = [];
    // if(pair) tTable.push({table : {}, dims : numberOfVars, functionName : '', vars : excitation.colLabels + excitation.rowLabels});
    for(let i = 0; i < excitation.entryLength; ++i){
        tTable.push({table : {}, dims : numberOfVars,functionName : '', vars : excitation.rowLabels + excitation.colLabels});
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

export function generateKMap(truthTable : truthTable, numberOfTotalVars : number) : kMap{
    if(numberOfTotalVars < 5){
        let row = Math.floor(numberOfTotalVars / 2);
        let col = numberOfTotalVars - row;
        let rowComb = getInputCombination(row);
        let colComb = getInputCombination(col);
        let kMap : kMap = {
            map : {},
            dims : {
                rem : 0,
                row : row,
                col : col
            },
            functionName : truthTable.functionName,
            vars : {
                rem : '',
                row : truthTable.vars.slice(0, 2 * row),
                col : truthTable.vars.slice( 2 * row)
            }
        };
        kMap.map[''] = {}
        
        rowComb.forEach(rcomb=>{
            kMap.map[''][rcomb] = {}
            colComb.forEach(ccomb=>{
                kMap.map[''][rcomb][ccomb] = truthTable.table[rcomb + ccomb];
            })
        })
        return kMap;
    }
    else{
        
        let rem = numberOfTotalVars - 4;
        let remCombs = getInputCombination(rem);
        let comb = getInputCombination(4);

        let kMap : kMap = {
            map : {},
            dims : {
                rem : rem,
                row : 2,
                col : 2
            },
            functionName : truthTable.functionName,
            vars : {
                rem : truthTable.vars.slice(0, 2 * rem),
                row : truthTable.vars.slice(2 * rem, 2 * rem + 4),
                col : truthTable.vars.slice(-4)
            }
        };

        remCombs.forEach(remComb=>{
            let tTable : truthTable = {
                table : {},
                dims : numberOfTotalVars,
                functionName : truthTable.functionName,
                vars : truthTable.vars.slice(-4)
            };
            comb.forEach(c=>{
                tTable.table[c] = truthTable.table[remComb + c];
            })
            kMap.map[remComb] = generateKMap(tTable, 4).map[''];
        })
        return kMap;
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

export function simplifyFunction(truthTable : truthTable) : {
    EPIs : tabulationGroupItem[],
    PIs : tabulationGroupItem[],
    selectedPIs : tabulationGroupItem[]
}   
{
    let inpComb = getInputCombination(truthTable.dims);
    let nonZeroinpComb = inpComb.filter(comb=>truthTable.table[comb] != '0');
    let groups : tabulationGroupItem[][] = [];
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
        EPIs : epi,
        PIs : notTaken,
        selectedPIs : [...epi, ...remPIs ]
    }
    



    // console.log(coveringMap);

    // console.log(notTaken);
}

export function getLiteral(comb : string, vars : string): string{
    let r = '';
    for(let i = 0; i < comb.length; ++i){
        if(comb[i] == '_')
            continue;
        else if(comb[i] == '0'){
            r += vars.slice(2 * i, 2 * i + 2) + "'";
        }
        else r += vars.slice(2 * i, 2 * i + 2);
    }
    if(r == '') return '1';
    return r;
}

export function stateMinimization(stateLabels : string[], nextStateMap : nextStateMap, numberOfInputVars : number):implicationEntryMap{
    let separator = ' ';
    let inpComb = getInputCombination(numberOfInputVars);

    const combineStateLabels = (l1 : string, l2 : string) : string =>{
        if(l1 < l2) return l1 + separator + l2;
        return l2 + separator + l1; 
    }
    const dependency = (state1 : string, state2 : string) : string[] =>{
        let arr : string[] = [];
        inpComb.forEach(comb=>{
            let nx1 = nextStateMap[state1][comb].state;
            let nx2 =  nextStateMap[state2][comb].state;
            if(nx1 === nx2) return;
            if(combineStateLabels(nx1, nx2) === combineStateLabels(state1, state2)) return;
            arr.push(combineStateLabels(nx1, nx2));
        })
        let currComb = combineStateLabels(state1, state2);
        arr = arr.filter(c => c !== currComb);
        return arr;
    }
    const doesOutputMatch = (s1 : string, s2 : string) : boolean =>{
        for(let i = 0; i < inpComb.length; ++i){
            let comb = inpComb[i];
            if(nextStateMap[s1][comb].output !== nextStateMap[s2][comb].output) return false;
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

export async function maximalCompatibles( labels : string[], entries : implicationEntryMap){

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
                if(entries[s1][s2].isCompatible){
                    let i1 = labelToIndex[s1];
                    let i2 = labelToIndex[s2];
                    adj[i1].push(i2);
                    adj[i2].push(i1);
                }
            }
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

    const getComibations = (n : number, startFrom : number) : {
        [len : number] : string[]
    }=>{
        let combinations : {
            [len : number] : string[]
        } = {}
        let mx = (1 << n);
        for(let i = 1; i < mx; ++ i){
            let curr = i.toString(2);
            let count = count1(curr);
            if(count <= startFrom){
                if(!combinations[count]) combinations[count] = []
                combinations[count].push(curr);
            }
        }
        return combinations;
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

    const checkCompatible = (stateIndexes : number[])=>{
        let n = stateIndexes.length;
        for(let i = 0; i < n; ++i){
            let s1 = labels[stateIndexes[i]];
            for(let j = i + 1; j < n; ++j){
                let s2 = labels[stateIndexes[j]];
                if(s1 === s2) continue;
                if(!entries[s1][s2].isCompatible) return false;
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
    let maximalCompatibles : number[][] = [];
    console.log(adj);
    console.log(upperBound);
    let combs = getComibations(n , upperBound);
    for(let i = upperBound; i > 0; --i){
        combs[i].forEach(comb=>{
            let indexes = getCombStates(comb);
            if(maximalCompatibles.some(m => doesContain(m, indexes)))
                return;
            // let str = convertToString(indexes);
            // if(maximalCompatibles.includes(str)) return;
            if(checkCompatible(indexes)){
                maximalCompatibles.push(indexes);
                // maximalCompatibles += convertToString(indexes);

            }
        })
    }

    // await new Promise(resolve => setTimeout(resolve, 10000));

    // console.log(combs);
    console.log('compatibles', maximalCompatibles);
    return maximalCompatibles;

}