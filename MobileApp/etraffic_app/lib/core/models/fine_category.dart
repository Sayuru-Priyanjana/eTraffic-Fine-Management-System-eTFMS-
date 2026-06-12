class FineCategory {
  final int id;
  final String identifier;
  final String description;
  final double amount;

  FineCategory({
    required this.id,
    required this.identifier,
    required this.description,
    required this.amount,
  });

  factory FineCategory.fromJson(Map<String, dynamic> json) {
    return FineCategory(
      id: json['id'] as int,
      identifier: json['identifier'] as String,
      description: json['description'] as String,
      amount: (json['amount'] as num).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'identifier': identifier,
      'description': description,
      'amount': amount,
    };
  }
}
