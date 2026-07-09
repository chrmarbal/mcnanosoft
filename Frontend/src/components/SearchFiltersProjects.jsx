import React, { useContext } from 'react'
import "../css/Filters.css"
import { userContext } from '../context/UserContext'

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
                    <h6>Ordenar Por</h6>
                    <select 
                        style={{marginTop: "-10px"}} 
                        value={filters.sortBy} 
                        onChange={e => setFilters(f => ({ ...f, sortBy: e.target.value }))}
                    >
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

                    <h6>Filtrar por Precio</h6>
                    <div className="rangeSliderContainer">
                        <label>Rango de precio: {filters.minPrice}€ - {filters.maxPrice}€</label>
                        <div className="sliderTrack">
                            <input 
                                type="range" 
                                min="0" 
                                max="450" 
                                value={filters.minPrice}
                                onChange={e => {
                                    const value = Number(e.target.value)
                                    if (value <= filters.maxPrice) {
                                        setFilters(f => ({ ...f, minPrice: value }))
                                    }
                                }}
                            />
                        </div>
                    </div>
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