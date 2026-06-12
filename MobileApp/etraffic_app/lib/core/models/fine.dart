class Fine {
  final int id;
  final String referenceNumber;
  final int categoryId;
  final String driverId;
  final String officerId;
  final double amount;
  final DateTime issueDate;
  final DateTime dueDate;
  final String status;

  Fine({
    required this.id,
    required this.referenceNumber,
    required this.categoryId,
    required this.driverId,
    required this.officerId,
    required this.amount,
    required this.issueDate,
    required this.dueDate,
    required this.status,
  });

  factory Fine.fromJson(Map<String, dynamic> json) {
    return Fine(
      id: json['id'] as int,
      referenceNumber: json['referenceNumber'] as String,
      categoryId: json['categoryId'] as int,
      driverId: json['driverId'] as String,
      officerId: json['officerId'] as String,
      amount: (json['amount'] as num).toDouble(),
      issueDate: DateTime.parse(json['issueDate'] as String),
      dueDate: DateTime.parse(json['dueDate'] as String),
      status: json['status'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'referenceNumber': referenceNumber,
      'categoryId': categoryId,
      'driverId': driverId,
      'officerId': officerId,
      'amount': amount,
      'issueDate': issueDate.toIso8601String(),
      'dueDate': dueDate.toIso8601String(),
      'status': status,
    };
  }
}
