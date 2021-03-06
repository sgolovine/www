import React from 'react'
import { Link as GatsbyLink } from 'gatsby'
import { useNavLinks } from '~/hooks/useNavLinks'

export const NavHeader = () => {
  const headerLinks = useNavLinks()
  return (
    <div className="flex flex-row justify-center md:justify-end pt-6">
      {headerLinks.map((headerLink) => {
        if (headerLink.enabled) {
          if (headerLink.external) {
            return (
              <a
                className="text-blue-600 hover:text-blue-400 px-2 text-lg font-semibold"
                key={headerLink.alt}
                href={headerLink.route}
              >
                {headerLink.name}
              </a>
            )
          } else {
            return (
              <GatsbyLink
                className="text-blue-600 hover:text-blue-400 px-2 text-lg font-semibold"
                key={headerLink.alt}
                to={headerLink.route}
              >
                {headerLink.name}
              </GatsbyLink>
            )
          }
        }
      })}
    </div>
  )
}
