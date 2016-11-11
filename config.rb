###
# Page options, layouts, aliases and proxies
###

# Per-page layout changes:
#
# With no layout
page '/*.xml', layout: false
page '/*.json', layout: false
page '/*.txt', layout: false

# With alternative layout
# page "/path/to/file.html", layout: :otherlayout

# Proxy pages (http://middlemanapp.com/basics/dynamic-pages/)
# proxy "/this-page-has-no-template.html", "/template-file.html", locals: {
#  which_fake_page: "Rendering a fake page with a local variable" }

# General configuration

# Reload the browser automatically whenever files change
configure :development do
  activate :livereload
end

###
# Helpers
###

# Methods defined in the helpers block are available in templates
# helpers do
#   def some_helper
#     "Helping"
#   end
# end

# Build-specific configuration
configure :build do
  # Minify CSS on build
  activate :minify_css

  # Minify Javascript on build
  activate :minify_javascript
end

ignore "stylesheets/**/*.py"
ignore "stylesheets/**/.editorconfig"
ignore "stylesheets/**/.git"
ignore "stylesheets/**/.gitattributes"
ignore "stylesheets/**/bower.json"
ignore "stylesheets/**/index.html"
ignore "stylesheets/**/license"
ignore "stylesheets/**/package.json"
ignore "stylesheets/**/README"
ignore "stylesheets/**/readme"

Time.zone = "Taipei"

activate :blog do |blog|
  blog.permalink = "{year}/{month}/{slug}.html"
  MAX = 100
  blog.summary_generator = Proc.new{ |_, content|
    s = Sanitize.fragment(content)[0..MAX]
    "#{s}#{s.length > MAX ? "..." : ""}"
  }
end

activate :deploy do |deploy|
  deploy.deploy_method = :git
  deploy.branch = :master
end

activate :disqus do |d|
  d.shortname = 'henry40408'
end

activate :google_analytics do |ga|
  ga.tracking_id = 'UA-6529501-15'
end

set :markdown_engine, :redcarpet
set :markdown, autolink: true, fenced_code_blocks: true, footnotes: true, smartypants: true
activate :syntax
