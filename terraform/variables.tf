variable "aws_region" {
  description = "Região da AWS"
  type        = string
  default     = "sa-east-1"
}

variable "table_name" {
  description = "Nome da tabela DynamoDB"
  type        = string
  default     = "Transactions"
}

variable "lambda_function_name" {
  description = "Nome da função Lambda"
  type        = string
  default     = "TransactionsAPI"
}

variable "api_name" {
  description = "Nome da API Gateway"
  type        = string
  default     = "TransactionsAPI"
}