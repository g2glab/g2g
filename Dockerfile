FROM g2glab/pg:0.3.5

RUN cd /opt \
 && wget http://ftp.jaist.ac.jp/pub/apache/jena/binaries/apache-jena-3.17.0.zip \
 && unzip apache-jena-3.17.0.zip
ENV PATH $PATH:/opt/apache-jena-3.17.0/bin

RUN cd /opt \
 && git clone -b v0.3.8 https://github.com/g2glab/g2g.git \
 && cd g2g \
 && npm install \
 && npm link

WORKDIR /work
