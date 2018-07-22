import Typography from 'typography'
import Wordpress2016 from 'typography-theme-wordpress-2016'

Wordpress2016.overrideThemeStyles = () => ({
  'h1,h2,h3,h4,h5,h6': {
    lineHeight: 1.75,
  },
  'a.gatsby-resp-image-link': {
    boxShadow: 'none',
  },
  '.gatsby-highlight': {
    marginBottom: '1.75rem',
  },
})

delete Wordpress2016.googleFonts

Wordpress2016.baseFontSize = '18px'

const typography = new Typography(Wordpress2016)

// Hot reload typography in development.
if (process.env.NODE_ENV !== 'production') {
  typography.injectStyles()
}

export default typography
