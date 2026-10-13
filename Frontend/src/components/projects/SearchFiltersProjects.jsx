import React, { useContext } from 'react'
import "../../css/Filters.css"
import { userContext } from '../../context/UserContext'

function SearchFiltersProjects({ filters, setFilters, isOpen, setIsOpen }) {
    const technologies = ["JavaScript", "C", "Python", "Java", "C++", "C#", "PHP"]
    const {userData} = useContext(userContext)

    const handleTechChange = (tech) => {
        setFilters(prev => ({
            ...prev,
            technologies: prev.technologies.includes(tech)
                ? prev.technologies.filter(t => t !== tech)
                : [...prev.technologies, tech]
        }))
    }

    return (
        <>  
            <div className={`filters-overlay d-lg-none ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(false)}></div>
            
            <div className={`filters ${isOpen ? 'active' : ''}`}>
                <button className="close-filters d-lg-none" onClick={() => setIsOpen(false)}>
                    <i className="fa-solid fa-times"></i>
                </button>
                
                <legend>Filtrar Proyectos</legend>
                <form>
                    <h6>Ordenar por</h6>
                    <select value={filters.sortBy} onChange={e => setFilters(f => ({ ...f, sortBy: e.target.value }))}>
                        <option value="recent">Más recientes</option>
                        <option value="cheap">Más baratos</option>
                        <option value="expensive">Más caros</option>
                        <option value="popular">Más populares</option>
                    </select>

                    <fieldset>
                        <h6>Tecnologías</h6>
                        {technologies.map(tech => (
                            <label key={tech}>
                                <input 
                                    type="checkbox" 
                                    checked={filters.technologies.includes(tech)} 
                                    onChange={() => handleTechChange(tech)}
                                />
                                {tech}
                            </label>
                        ))}
                    </fieldset>

                    <h6>Precio: {filters.minPrice}€ - {filters.maxPrice}€</h6>
                    <label className="rangeSliderContainer">
                        Mínimo
                        <input type="range" min="0" max="450" value={filters.minPrice} onChange={e => {
                            const minPrice = Number(e.target.value)
                            if(minPrice <= filters.maxPrice) setFilters(f => ({ ...f, minPrice }))
                        }}/>
                    </label>
                    <label className="rangeSliderContainer">
                        Máximo
                        <input type="range" min="0" max="450" value={filters.maxPrice} onChange={e => {
                            const maxPrice = Number(e.target.value)
                            if(maxPrice >= filters.minPrice) setFilters(f => ({ ...f, maxPrice }))
                        }}/>
                    </label>

                    <h6>Otros Filtros</h6>
                    <label>
                        <input 
                            type="checkbox" 
                            checked={filters.openSource} 
                            onChange={() => setFilters(f => ({ ...f, openSource: !f.openSource }))}
                        />
                        Código Abierto
                    </label>
                    {userData && userData.data && userData.data.profile == "Administrador" ? (
                        <label>
                            <input 
                                type="checkbox" 
                                checked={filters.deleted} 
                                onChange={() => setFilters(f => ({ ...f, deleted: !f.deleted }))}
                            />
                            Eliminado
                        </label>
                    ) : null}
                </form>
            </div>
        </>
    )
}

export default SearchFiltersProjects