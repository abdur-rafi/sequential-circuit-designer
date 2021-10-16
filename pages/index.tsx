import HeaderFooterContent from "../Components/FooterHeaderContent";
import styles from '../styles/index.module.scss'

function Index(){

    return(
    <HeaderFooterContent useFooter = {true} useHeight = {false} content = {<Index_></Index_>} />
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
                            3 Modes of Operation
                        </h1>
                    </div>  
                    <div className = {styles.body}>
                        <ul>
                            <li>Synchronous</li>
                            <li>Pulse Mode</li>
                            <li>Fundamental Mode</li>
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

export default Index;