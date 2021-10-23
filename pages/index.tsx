import HeaderFooterContent from "../Components/FooterHeaderContent";
import styles from '../styles/index.module.scss'
import stateTableImage from '../public/images/statetable2.png';
import mergerDiagramImage from '../public/images/mergerdiagram2.png';
import implicationTableImage from '../public/images/implicationtable2.png';
import maximalCompatiblesImage from '../public/images/maximalcompatibles2.png'
import maximalIncompatiblesImage from '../public/images/maximalincompatibles2.png'
import closureTableImage from '../public/images/closuretable2.png'
import reducedStateImage from '../public/images/reducedstates2.png'

import reducedStateTableImage from '../public/images/reducedstatetable.png'
import transitionTableImage from '../public/images/transitiontable2.png'
import excitationTableImage from '../public/images/excitationtable.png'
import kmapImage from '../public/images/kmap.png'
import latchEquationsImage from '../public/images/latcheqns.png'
import stateDiagramImage from '../public/images/statediagram.png'
import stateTableInput from '../public/images/statetableinput.png'
import tabulationFirst from '../public/images/tabulation12.png'





// const merger = require
import Image from 'next/image'
import Link from "next/link";

function Index(){

    return(
    <HeaderFooterContent useMinWidth = {true} useFooter = {true} useHeight = {false} content = {<Index__></Index__>} />
    )

}

const Index_ : React.FC<{

}> = (props)=>{
    return(
        <div className = {styles.root} >
            <div className = {styles.titleContainer}>
                <div>
                    <h2>
                        Sequential Circuits 
                    </h2>
                </div>
            </div>
            <div className = {styles.cardsContainer}>
                <div className = {styles.card}>
                    <div className = {styles.header}>
                        <h1>
                            2 Modes of Operation
                        </h1>
                    </div>  
                    <div className = {styles.body}>
                        <ul>
                            <li>Synchronous</li>
                            <li>Pulse Mode</li>
                        </ul>
                    </div>
                </div>
                <div className = {styles.card}>
                    <div className = {styles.header}>
                        <h1>
                            Produce
                        </h1>
                    </div>
                    <div className = {styles.body}>
                        <ul>
                            <li>State Table</li>
                            <li>Implication Table</li>
                            <li> Merger Diagrams </li>
                            <li>Maximal compatibles and incompatibles</li>
                            <li>Optimal reduced state</li>
                            <li>Transition Table</li>
                            <li>Excitaion Table</li>
                            <li>Kmaps</li>
                            <li>Latch input equations </li>
                            <li> Outpus equations</li>
                            
                        </ul>
                    </div>

                </div>
                <div className = {styles.card}>
                    <div className = {styles.header}>
                        <h1>
                            Draw State Diagram
                        </h1>
                    </div>
                    <div className = {styles.body}>
                        Synthesize circuit by drawing state diagram for synchronous and pulse mode circuit
                    </div>

                </div>
                <div className = {styles.card}>
                    <div className = {styles.header}>
                        <h1>
                            Provide State Table
                        </h1>
                    </div>
                    <div className = {styles.body}>
                        Synthesize circuit by providing state table for synchronous, pulse mode and fundamental mode circuit
                    </div>

                </div>
            </div>
            
            <div className = {styles.titleContainer}>
                <div>
                    <h2>
                        Combinational Circuits
                    </h2> 
                </div>
            </div>
            <div className = {styles.cardsContainer}>
                <div className = {styles.card}>
                    <div className = {styles.header}>
                        <h1>
                            Simplify Functions
                        </h1>
                    </div>  
                    <div className = {styles.body}>
                        Provide a function as sum of minterms or product of maxterms.
                        Use kmap or tabulation method
                    </div>
                </div>

                <div className = {styles.card}>
                    <div className = {styles.header}>
                        <h1>
                            Get All Prime Implicants
                        </h1>
                    </div>  
                    <div className = {styles.body}>
                        Get prime implicants and essential prime implciants of a function
                    </div>
                </div>

                <div className = {styles.card}>
                    <div className = {styles.header}>
                        <h1>
                            Get Steps of Tabulation Method
                        </h1>
                    </div>  
                    <div className = {styles.body}>
                        Get steps of Tabulation method while simplifying functions
                    </div>
                </div>

                

            </div>
            
        </div>
    )
}

const Card : React.FC<{
    file : StaticImageData,
    title : string
}> = (props)=>{
    return(
        <div className = {styles.card}>
            <div className = {styles.cardImageContainer}>
                <Image src = {props.file} className = {styles.cardImage} quality = {100} height = {250} width = {220}/>
            </div>
            <div className = {styles.cardBody}>
                <h3> {props.title} </h3>
            </div>
        </div>
    )
}

function Index__(){
    return(
        <div className = {styles.root}>
            <div className = {styles.sequentialContainer}>
                <div className = {styles.sequentialTitle}>
                    <h1> Sequential circuits </h1>
                </div>
                <div className = {styles.modeContainer}> 
                    2 Modes of Operation<br/>
                    Synchronous <br/> &amp;
                    Asynchronous Pulse Mode
                </div>
                <div className = {styles.produceContainer}>
                    <div className = {styles.title}>
                        From State Diagram or State Table Determine:
                    </div>
                    <div className = {styles.cardsContainer}>
                        <Card file={stateTableImage} title={"State Table"}  />
                        <Card file = {mergerDiagramImage} title = {'Merger Diagram'} />
                        <Card file = {implicationTableImage} title = {'Implication Table'} />
                        <Card file = {maximalCompatiblesImage} title = {'Maximal compatibles'} />
                        <Card file = {maximalIncompatiblesImage} title = {'Maximal Incompatibles'} />
                        <Card file = {closureTableImage} title = {'Closure Table'} />
                        <Card file = {reducedStateImage} title = {'Reduced States'} />
                        <Card file = {reducedStateTableImage} title = {'Reduced State Table'} />
                        <Card file = {transitionTableImage} title = {'Transition Table'} />
                        <Card file = {excitationTableImage} title = {'Excitation Table'} />
                        <Card file = {kmapImage} title = {'Kmap'} />
                        <Card file = {latchEquationsImage} title = {'latch & output equations'} />

                    </div>
                </div>
                <div className = {styles.drawStateDiagramContainer}>
                    <div>
                        <Link href = '/statediagram' >
                            <a>
                                Circuit synthesis from state diagram 
                            </a>
                        </Link>
                    </div>
                    <div>
                        <Image src={stateDiagramImage} height = {300} width = {300} />
                    </div>
                </div>
                <div className = {styles.drawStateDiagramContainer}>
                    <div>
                        <Link href = '/statetable'>
                            <a>
                                Circuit synthesis from state table
                            </a>
                        </Link>
                    </div>
                    <div>
                        <Image src={stateTableInput} height = {300} width = {300} />
                    </div>
                </div>
            </div>
            <div className = {styles.combinationalContainer}>
                <div>
                    <h1>Combinational circuits</h1>
                </div>
                <div className = {styles.simplifyContainer}>
                    Simplify functions from sum of minterms or product of maxterms
                </div>
                <div className = {styles.implicantsCotainer}>
                    Determine All prime implicants and essential prime implicants
                </div>
                <div className = {styles.kmapContainer}>
                    <div>
                        <Link href = '/functionminimization/kmap' >
                            <a>
                                Generate kmaps with bounding boxes
                            </a>
                        </Link>
                    </div>
                    <div>
                        <Image src = {kmapImage} height = {300} width = {300}  />
                    </div>
                </div>
                <div className = {styles.tabulationContainer}>
                    <div>
                        <Link href = '/functionminimization/tabulation'>
                            <a>
                                Generate steps of tabuation method 
                            </a>
                        </Link>
                    </div>
                    <div>
                        <Image src = {tabulationFirst} height = {300} width = {300}  />
                    </div>
                </div>

            </div>
            
        </div>
    )
}

export default Index;