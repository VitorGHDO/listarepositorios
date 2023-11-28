import React, {useState, useEffect} from 'react';
import { useParams } from "react-router-dom";
import { Container, Owner, Loading, BackButton, IssuesList, PageActions, FilterList } from './styles';
import {FaArrowLeft} from "react-icons/fa"
import api from '../../services/api'

export default function Repositorio(){
    const name = useParams();
    const [repositorio,setRepositorio] = useState({}); //Não é array pq vem só um repositorio
    const [issues, setIssues] = useState([]); //Array pois vem mais de uma issue por repositorio
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState([
        {state: 'all', label: 'Todas', active: true},
        {state: 'open', label: 'Abertas', active: false},
        {state: 'closed', label: 'Fechadas', active: false},
    ]);
    const [filterIndex, setFilterIndex] = useState(0);

    useEffect(() => {
        async function load() {
            const nomeRepo = decodeURIComponent(name.repositorio);

            //Dessa forma fica dois tipos de requisição separadas
                //const response = await api.get(`repos/${nomeRepo}`)
                //const issues = await api.get(`repos/${nomeRepo}/issues`)
            //

            //Dessa forma as duas requisições executam ao mesmo tempo
            const [repositorioData, issuesData] = await Promise.all([
                api.get(`repos/${nomeRepo}`),
                api.get(`repos/${nomeRepo}/issues`, {
                    params: {
                        //limitando 5 issues por página e que estejam abertas
                        state: filters.find(f => f.active).state,
                        per_page: 5
                    }
                })
            ]);

           setRepositorio(repositorioData.data);
           setIssues(issuesData.data);
           setLoading(false);

        }

        load();
    },[filters, name.repositorio]);

    useEffect(() => {
        async function loadIssue(){
            const nomeRepo = decodeURIComponent(name.repositorio);

            const response = await api.get(`/repos/${nomeRepo}/issues`, {
                params: {
                    state: filters[filterIndex].state,
                    page,
                    per_page: 5,
                },
            });

            setIssues(response.data);

        }

            loadIssue();

    },[filterIndex, filters, name.repositorio, page]);

    function handlePage(action){
        setPage(action === 'back' ? page - 1 : page + 1)
    }

    function handleFilter(index){
        setFilterIndex(index);
    }

    if(loading){
        return(
            <Loading>
                <h1>Carregando...</h1>
            </Loading>
        )
    }
    
    return(
        //  <h1 style={{color:'#fff'}}>
        //     {decodeURIComponent(useParams().repositorio)}
        // </h1>
        <Container>
            <BackButton to="/">
                <FaArrowLeft size={30}/>
            </BackButton>

            <Owner>
                <img 
                    src={repositorio.owner.avatar_url} 
                    alt={repositorio.owner.login}
                />
                <h1>{repositorio.name}</h1>
                <p>{repositorio.description}</p>
            </Owner>

            <FilterList active={filterIndex}>
                {filters.map((filter, index) => (
                    <button
                        type='button'
                        key={filter.label}
                        onClick={()=>handleFilter(index)}
                    >
                        {filter.label}
                    </button>
                ))}
            </FilterList>

            <IssuesList>
                {issues.map(issue =>(
                        <li key={String(issues.id)}>
                            <img src={issue.user.avatar_url} alt={issue.user.login}/>
                            <div>
                                <strong>
                                    <a href={issue.html_url}>{issue.title}</a>

                                    {issue.labels.map(label => (
                                        <span key={String(label.id)}>{label.name}</span>
                                    ))}

                                    <p>{issue.user.login}</p>
                                </strong>
                            </div>
                        </li>
                ))}
            </IssuesList>

            <PageActions>
                <button type="button" onClick={()=>handlePage('back')} disabled={page < 2}>Voltar</button>
                <button type="button" onClick={()=>handlePage('next')}>Próxima</button>
            </PageActions>
        </Container>
    );
}