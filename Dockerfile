FROM g2gml/pg:0.2.2

RUN cd /opt \
 && wget http://ftp.jaist.ac.jp/pub/apache/jena/binaries/apache-jena-3.9.0.zip \
 && unzip apache-jena-3.9.0.zip
ENV PATH $PATH:$PWD/apache-jena-3.9.0/bin

RUN cd /opt \
 && git clone -b v0.2.1 https://github.com/g2gml/g2g.git \
 && cd g2g \
 && npm install \
 && npm link

WORKDIR /work
