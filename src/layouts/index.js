import React from 'react'
import Link from 'gatsby-link'
import styled from 'styled-components'

import { rhythm, scale } from '../utils/typography'

require('prismjs/themes/prism-tomorrow.css')

let Container = styled.div`
  margin-left: auto;
  margin-right: auto;
  max-width: ${rhythm(24)};
  padding: ${rhythm(1.5)} ${rhythm(0.75)};
`

let RootHeader = styled.h1`
  ${scale(1.25)};
  margin-bottom: ${rhythm(1.5)};
  margin-top: 0;
`

let CleanLink = styled(Link)`
  box-shadow: none;
  text-decoration: none;
  color: inherit;
`

let Header = styled.h3`
  font-family: Montserrat, sans-serif;
  margin-top: 0;
  margin-bottom: ${rhythm(-1)};
`

class Template extends React.Component {
  render() {
    const { location, children } = this.props
    let header

    let rootPath = `/`
    if (typeof __PREFIX_PATHS__ !== `undefined` && __PREFIX_PATHS__) {
      rootPath = __PATH_PREFIX__ + `/`
    }

    if (location.pathname === rootPath) {
      header = (
        <RootHeader>
          <CleanLink to={'/'}>Life is a YOLO game</CleanLink>
        </RootHeader>
      )
    } else {
      header = (
        <Header>
          <CleanLink to={'/'}>Life is a YOLO game</CleanLink>
        </Header>
      )
    }
    return (
      <Container>
        {header}
        {children()}
      </Container>
    )
  }
}

export default Template
