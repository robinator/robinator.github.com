task :default => 'deploy'

desc 'Deploy static site to github'
task :deploy do
  puts "Deploying site to github..."
  sh "staticmatic build ."
  sh "cp -R site ."
end