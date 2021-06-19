FROM alpine:3.13

RUN apk add --no-cache git npm openjdk11-jre-headless

RUN cd /opt \
 && git clone https://github.com/g2glab/pg \
 && cd pg \
 && npm install && npm link

ENV JENA_VERSION 3.17.0
RUN cd /opt \
 && wget http://archive.apache.org/dist/jena/binaries/apache-jena-${JENA_VERSION}.zip \
 && unzip apache-jena-${JENA_VERSION}.zip && rm apache-jena-${JENA_VERSION}.zip
ENV PATH $PATH:/opt/apache-jena-${JENA_VERSION}/bin

RUN cd /opt \
 && git clone https://github.com/g2glab/g2g \
 && cd g2g \
 && npm install && npm link

WORKDIR /work
