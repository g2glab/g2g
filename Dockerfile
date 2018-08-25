FROM node:8.11.4

RUN apt-get update && apt-get install -y \
    unzip \
    vim

RUN wget http://ftp.tsukuba.wide.ad.jp/software/apache/jena/binaries/apache-jena-3.8.0.zip \
 && unzip apache-jena-3.8.0.zip
ENV PATH $PATH:`pwd`/apache-jena-3.8.0/bin

RUN git clone -b v0.1.0 https://github.com/g2gml/pg.git \
 && cd pg && npm install && npm link

RUN git clone -b v0.1.0 https://github.com/g2gml/g2g.git \
 && cd g2g && npm install && npm link
