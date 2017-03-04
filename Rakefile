livereload_port = 35729

task default: [:development]

task :local_build do
  sh "bundle exec jekyll build -D"
end

task :development do
  sh "bundle exec jekyll serve -D -L -R #{livereload_port}"
end


task check_html: [:local_build] do
  sh "bundle exec htmlproofer ./_site --check-html --disable-external"
end
