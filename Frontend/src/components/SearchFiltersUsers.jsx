import React from 'react'
import "../css/Filters.css"

function SearchFiltersUser({ filters, setFilters, isOpen, setIsOpen }) {
    return (
        <>
            <div className={`filters-overlay d-lg-none ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(false)}></div>
            
            <div className={`filters ${isOpen ? 'active' : ''}`}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <legend className="mb-0">Filtrar Usuarios</legend>
                    <button className="close-filters d-lg-none" onClick={() => setIsOpen(false)}>
                        <i className="fa-solid fa-times"></i>
                    </button>
                </div>
                
                <form>
                    <h6>Ordenar Por</h6>
                    <select style={{ marginTop: "-10px" }} value={filters.sortBy} onChange={e => setFilters(f => ({ ...f, sortBy: e.target.value }))}>
                        <option value="recent">Más recientes</option>
                        <option value="name-asc">Nombre (A-Z)</option>
                        <option value="name-desc">Nombre (Z-A)</option>
                    </select>

                    <label>
                        <input type="checkbox" checked={!filters.active} onChange={() => setFilters(f => ({ ...f, active: !f.active }))}/>
                        Eliminado
                    </label>
                </form>
            </div>
        </>
    )
}

export default SearchFiltersUser