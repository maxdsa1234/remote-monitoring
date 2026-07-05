# Official AWS Lambda Python 3.11 image
FROM public.ecr.aws/lambda/python:3.11

# Copying requirements file into the container
COPY requirements.txt .

# Install the libraires
RUN pip3 install --upgrade pip && \
    pip3 install -r requirements.txt --target "${LAMBDA_TASK_ROOT}"

# Copying the function code and model into the container
COPY lambda_function.py ${LAMBDA_TASK_ROOT}
COPY lstm_autoencoder.onnx ${LAMBDA_TASK_ROOT}
COPY lstm_autoencoder.onnx.data ${LAMBDA_TASK_ROOT}

# setting CMD to handler function in AWS lambda
CMD [ "lambda_function.lambda_handler" ]
