FROM ubuntu

RUN apt-get update
RUN apt-get install -y python3 python3-pip netcat
RUN python3 -m pip install flask

EXPOSE 5001
RUN mkdir app
COPY ./api.py ./app
WORKDIR ./app
CMD python3 api.py

