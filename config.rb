Time.zone = "Taipei"

# Disable layout for some MIME types

page "/*.xml", layout: false
page "/*.json", layout: false
page "/*.txt", layout: false

# Markdown engine

set :markdown_engine, :redcarpet
set :markdown,
    autolink: true,
    fenced_code_blocks: true,
    footnotes: true,
    smartypants: true

# Development and build configuration

configure :development do
  activate :livereload
end

configure :build do
  activate :minify_css
  activate :minify_javascript
end

# Middleman plugins

activate :blog do |blog|
  blog.permalink = "{year}/{month}/{slug}.html"
  blog.tag_template = "/tag.html"
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

activate :google_analytics do |ga|
  ga.tracking_id = "UA-6529501-15"
end

# Custom helpers

helpers do
  def tiny_image_path(src)
    dir_segment = File.dirname(src)
    file_segment = "tiny-#{File.basename(src)}"
    "#{dir_segment}/#{file_segment}"
  end

  def tiny_image_tag(path, options={})
    image_tag(tiny_image_path(path), options)
  end
end
