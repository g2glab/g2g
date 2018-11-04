FROM openjdk:8-jdk

RUN curl -sL https://deb.nodesource.com/setup_8.x | bash - \
 && apt-get install -y nodejs

RUN apt-get update && apt-get install -y \
    unzip \
    vim

RUN wget http://ftp.jaist.ac.jp/pub/apache/jena/binaries/apache-jena-3.9.0.zip \
 && unzip apache-jena-3.9.0.zip
ENV PATH $PATH:$PWD/apache-jena-3.9.0/bin

RUN git clone -b v0.1.0 https://github.com/g2gml/pg.git \
 && cd pg && npm install && npm link

RUN git clone -b v0.1.0 https://github.com/g2gml/g2g.git \
 && cd g2g && npm install && npm link

RUN mkdir /work
WORKDIR /work
