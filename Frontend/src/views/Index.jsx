import React, { useEffect, useState, useRef } from 'react'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import TextAnimation from '../components/TextAnimation'
import { gsap } from 'gsap'
import "../css/Index.css"
import { useSendRequest } from '../components/SendRequest'
import { Link } from 'react-router-dom'

function Index() {
  const sendRequest = useSendRequest()
  const [featuredProjects, setFeaturedProjects] = useState([])
  const mainTextRef = useRef(null)
  const heroImageRef = useRef(null)

  const getData = async () => {
    const response = await sendRequest("get", "", "/projects")
    if (response.status === 200) {
      const nonDeleted = response.data.filter(pr => !pr.deleted)
      const sorted = nonDeleted.sort((a, b) => {
        const aDownloads = a.purchases || 0
        const bDownloads = b.purchases || 0
        return bDownloads - aDownloads
      })
      setFeaturedProjects(sorted.slice(0, 3))
    }
  }

  useEffect(() => {
    getData()

    // Animación de fade-in para el logo usando GSAP
    gsap.fromTo(heroImageRef.current,
      {
        opacity: 0,
        y: 30
      },
      {
        opacity: 1,
        y: 0,
        duration: 1.5,
        ease: "power2.out"
      }
    )
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
          observer.unobserve(entry.target)
        }
      },
      {
        threshold: 0.1,
        rootMargin: '-50px'
      }
    )

    if (mainTextRef.current) {
      observer.observe(mainTextRef.current)
    }

    return () => {
      if (mainTextRef.current) {
        observer.unobserve(mainTextRef.current)
      }
    }
  }, [])

  return (
    <>
      <Nav/>
      <div id="mainPage">
          <div ref={heroImageRef} className="hero-image">
            <img src="/imgs/Logo MCNANO SOFT.png" alt="Logo MCNANO SOFT" draggable={false}/>
          </div>

          <TextAnimation delay={1}>
            Mcnano Soft
          </TextAnimation>

          <div ref={mainTextRef} className="main-text fade-in">
            <p>
              McnanoSoft nace de la pasión por la tecnología y la creación digital. Cada aplicación, cada herramienta y cada línea de código que encuentres aquí ha sido pensada para aportar valor, entretener o resolver algo de forma sencilla.
            </p>
            <p>
              Este espacio es una ventana abierta a todo lo que desarrollo por cuenta propia, pero también un punto de encuentro para quienes disfrutan del software hecho con ganas. Si encuentras algo que te encaje, disfrútalo. Y si te mola lo que ves, estás más que invitado a formar parte de esta pequeña gran comunidad en crecimiento.
            </p>
          </div>
      
          <div className="featuredProjects">
            <h1>Proyectos Destacados</h1>
            <div className="projects-grid">
              {featuredProjects.map((project, index) => (
                <div key={index} className="project-card" style={{
                  backgroundImage: `url("https://localhost:3016/${project.thumbnail}")`,
                }}>
                  <div className="overlayIndex">
                    <h2>{project.name}</h2>
                    <p>{project.description?.slice(0, 80)}...</p>
                    <Link to={`/projects/${project.name}`} className="see-more">Ver más</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
      </div>
      <Footer/>
    </>
  )
}

export default Index