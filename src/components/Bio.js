import React from 'react'
import styled from 'styled-components'

// Import typefaces
import 'typeface-montserrat'
import 'typeface-merriweather'

import profilePic from '../../static/avatar.png'
import { rhythm } from '../utils/typography'

let BioContainer = styled.div`
  display: flex;
  margin-bottom: ${rhythm(2.5)};
`

let Avatar = styled.img`
  margin-right: ${rhythm(1 / 2)};
  margin-bottom: 0;
  width: ${rhythm(2)};
  height: ${rhythm(2)};
`

class Bio extends React.Component {
  render() {
    return (
      <BioContainer>
        <Avatar src={profilePic} alt={`Henry Wu`} />
        <p>
          Written by <strong>Henry Wu</strong> who lives and works in Taipei
          producing some nasty bugs.
        </p>
      </BioContainer>
    )
  }
}

export default Bio
