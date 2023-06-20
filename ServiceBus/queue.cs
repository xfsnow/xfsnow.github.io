// QueueClient instantiation
this.sendC1ient = new QueueC1ient(connectionString, BasicQueueName);
// TopicClient instantiation
this.sendC1ient = new TopicCIient(connectionString, BasicTopicName);

// Send code
var message = new message()
{
    ContentType = "application/json",
    Messageld = Guid.NewGuid().Tostring(),
};

await sendClient.SendAsync(message);