import React from 'react'
import Link, { withPrefix } from 'gatsby-link'
import styled from 'styled-components'

const CopyrightContainer = styled.div`
  a {
    box-shadow: none;
  }
`

const Copyright = () => (
  <CopyrightContainer>
    <Link to={'/'}>
      <img
        src="https://img.shields.io/badge/Author-Henry%20Wu-blue.svg"
        alt="Author: Henry Wu"
      />
    </Link>{' '}
    <a href="https://opensource.org/licenses/MIT">
      <img
        src="https://img.shields.io/badge/License-MIT-brightgreen.svg"
        alt="License: MIT"
      />
    </a>{' '}
    <a href="http://creativecommons.org/licenses/by-nc-nd/4.0/">
      <img
        src="https://img.shields.io/badge/License-CC%20BY--NC--ND%204.0-brightgreen.svg"
        alt="License: CC BY-NC-ND 4.0"
      />
    </a>
  </CopyrightContainer>
)

export default Copyright
