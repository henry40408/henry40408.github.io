Time.zone = "Taipei"

page "/*.xml", layout: false
page "/*.json", layout: false
page "/*.txt", layout: false

set :markdown, autolink: true, fenced_code_blocks: true, footnotes: true, smartypants: true
set :markdown_engine, :redcarpet

activate :blog do |blog|
  blog.permalink = "{year}/{month}/{slug}.html"
  blog.tag_template = "/tag.html"
end

configure :build do
  activate :minify_css
  activate :minify_javascript
end

activate :deploy do |deploy|
  deploy.deploy_method = :git
  deploy.branch = "master"

  committer_app = "#{Middleman::Deploy::PACKAGE} v#{Middleman::Deploy::VERSION}"
  commit_message = "Deployed using #{committer_app}"

  if ENV["TRAVIS_BUILD_NUMBER"] then
    commit_message += " (Travis Build \##{ENV["TRAVIS_BUILD_NUMBER"]})"
  end

  deploy.commit_message = commit_message
end

activate :disqus do |d|
  d.shortname = "henry40408"
end

configure :development do
  activate :livereload
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

activate :google_analytics do |ga|
  ga.tracking_id = "UA-6529501-15"
end

activate :syntax
