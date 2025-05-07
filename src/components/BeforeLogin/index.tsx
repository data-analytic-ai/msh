import React from 'react'

/**
 * BeforeLogin Component
 *
 * Custom welcome message displayed in the login page of Payload CMS admin panel.
 * This component helps users understand the purpose of the admin panel.
 */
const BeforeLogin: React.FC = () => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-2">¡Bienvenido a UrgentFix!</h3>
      <p className="mb-2">
        Estás a punto de iniciar sesión en nuestra plataforma. Una vez que inicies sesión podrás:
      </p>
      <ul className="list-disc pl-5 mb-3">
        <li className="mb-1">Acceder a tus solicitudes de servicio</li>
        <li className="mb-1">Solicitar nuevos servicios de emergencia</li>
        <li className="mb-1">Gestionar tu perfil y preferencias</li>
      </ul>
      <p className="mb-1">
        <span className="font-semibold">Clientes:</span> Accede para ver y gestionar tus solicitudes
      </p>
      <p className="mb-1">
        <span className="font-semibold">Contratistas:</span> Accede para administrar tus servicios
        asignados
      </p>
    </div>
  )
}

export default BeforeLogin
