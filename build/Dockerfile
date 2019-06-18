FROM alvisisme/docker-ubuntu-non-root-with-utils
LABEL maintainer="Alvis Zhao<alvisisme@gmail.com>"
ENTRYPOINT []
CMD ["/bin/bash"]

ENV DEBIAN_FRONTEND noninteractive

ENV ANDROID_NDK_VERSION r14b
ENV ANDROID_NDK_HOME /usr/local/android-ndk-${ANDROID_NDK_VERSION}
ENV PATH ${ANDROID_NDK_HOME}:$PATH

# install utils
RUN sudo apt-get update && sudo apt-get -y install unzip python make
# install ndk
RUN wget https://dl.google.com/android/repository/android-ndk-${ANDROID_NDK_VERSION}-linux-x86_64.zip && \
   sudo unzip android-ndk-${ANDROID_NDK_VERSION}-linux-x86_64.zip -d /usr/local && \
   rm -rf android-ndk-${ANDROID_NDK_VERSION}-linux-x86_64.zip

# Installs Node.js
RUN curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash - && \
    sudo apt-get install -y nodejs
