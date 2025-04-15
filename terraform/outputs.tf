output "api_url" {
  description = "URL base da API Gateway"
  value       = "${aws_api_gateway_stage.prod.invoke_url}/api"
}