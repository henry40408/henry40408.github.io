import React from 'react'
import Helmet from 'react-helmet'
import Link from 'gatsby-link'
import get from 'lodash/get'
import styled from 'styled-components'

import Bio from '../components/Bio'
import SEO from '../components/SEO'
import { rhythm, scale } from '../utils/typography'

let Date = styled.p`
  ${scale(-0.2)};
  display: block;
  margin-bottom: ${rhythm(1)};
  margin-top: ${rhythm(-1)};
`

let Separator = styled.hr`
  margin-bottom: ${rhythm(1)};
`

let PostNav = styled.ul`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  list-style: none;
  padding: 0;
`

class BlogPostTemplate extends React.Component {
  render() {
    const post = this.props.data.markdownRemark
    const siteTitle = get(this.props, 'data.site.siteMetadata.title')
    const { previous, next } = this.props.pathContext

    const postData = {
      excerpt: post.excerpt,
      frontmatter: {
        ...post.frontmatter,
        title: `${post.frontmatter.title} | ${siteTitle}`,
      },
    }

    return (
      <div>
        <SEO isBlogPost postData={postData} />
        <h1>{post.frontmatter.title}</h1>
        <Date>{post.frontmatter.date}</Date>
        <p dangerouslySetInnerHTML={{ __html: post.html }} />
        <Separator />
        <Bio />
        <PostNav>
          <li>
            {previous && (
              <Link to={previous.fields.slug} rel="prev">
                ← {previous.frontmatter.title}
              </Link>
            )}
          </li>
          <li>
            {next && (
              <Link to={next.fields.slug} rel="next">
                {next.frontmatter.title} →
              </Link>
            )}
          </li>
        </PostNav>
      </div>
    )
  }
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
        author
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      html
      excerpt
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
      }
    }
  }
`
