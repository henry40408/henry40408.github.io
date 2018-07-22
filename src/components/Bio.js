import React from 'react'
import styled from 'styled-components'
import { withPrefix } from 'gatsby-link'

// Import typefaces
import 'typeface-montserrat'
import 'typeface-merriweather'

import profilePic from '../../static/avatar.png'
import { rhythm } from '../utils/typography'

const BioContainer = styled.div`
  display: flex;
  margin-bottom: ${rhythm(2.5)};
`

const Avatar = styled.img`
  border-radius: 50%;
  border: 1px solid #eee;
  margin-right: ${rhythm(1)};
  width: ${rhythm(3)};
  height: ${rhythm(3)};
`

const BioText = styled.div`
  font-size: ${rhythm(0.55)};
`

class Bio extends React.Component {
  render() {
    return (
      <BioContainer>
        <Avatar src={profilePic} alt={`Henry Wu`} />
        <div>
          <BioText>
            Written by <strong>Henry Wu</strong> who lives and works in Taipei
            producing some nasty bugs.
          </BioText>
          <div>
            <a href={withPrefix('/rss.xml')}>RSS</a>
            {' | '}
            <a href="https://medium.com/@henry40408">Medium</a>
            {' | '}
            <a href="https://github.com/henry40408">GitHub</a>
          </div>
        </div>
      </BioContainer>
    )
  }
}

export default Bio
