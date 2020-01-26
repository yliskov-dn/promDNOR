# start prometheus
docker run -d --restart=always -p 9090:9090 \
  -v /home/dn/Documents/prom/prometheus.yml:/etc/prometheus/prometheus.yml \
  -v /home/dn/Documents/prom/first_rules.yml:/etc/prometheus/first_rules.yml \
  --name dnor_srm prom/prometheus \
  --web.enable-lifecycle \
  --config.file=/etc/prometheus/prometheus.yml \
  --storage.tsdb.path=/prometheus #\
#  --web.console.libraries=/usr/share/prometheus/console_libraries --web.console.templates=/usr/share/prometheus/consoles

# start node exporter
docker run -d --restart=always -p 9100:9100 \
  --net="host" \
  --pid="host" \
  -v "/:/host:ro,rslave" \
  --name node_exporter \
  quay.io/prometheus/node-exporter \
  --path.rootfs=/host