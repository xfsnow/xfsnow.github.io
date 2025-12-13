import matplotlib.pyplot as plt
import numpy as np

# 定义三角形顶点坐标
A = np.array([0, 3])
B = np.array([-2, 0])
C = np.array([4, 0])

# 计算AB和BC边的中点
D = (A + B) / 2
E = (B + C) / 2

# 计算AB和BC边的斜率
slope_AB = (A[1] - B[1]) / (A[0] - B[0]) if A[0] != B[0] else float('inf')
slope_BC = (C[1] - B[1]) / (C[0] - B[0]) if C[0] != B[0] else float('inf')

# 垂直平分线的斜率
slope_DG = -1 / slope_AB if slope_AB != 0 and slope_AB != float('inf') else float('inf')
slope_FE = -1 / slope_BC if slope_BC != 0 and slope_BC != float('inf') else float('inf')

# 使用向量法求交点P
def line_intersection(p1, p2, p3, p4):
    """计算两条直线的交点"""
    x1, y1 = p1
    x2, y2 = p2
    x3, y3 = p3
    x4, y4 = p4
    
    denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
    if abs(denom) < 1e-10:  # 平行或重合
        return None
    
    t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom
    u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom
    
    if 0 <= t <= 1 and 0 <= u <= 1:  # 交点在线段内
        px = x1 + t * (x2 - x1)
        py = y1 + t * (y2 - y1)
        return np.array([px, py])
    else:
        return None

# 求交点P
P = line_intersection(D, D + np.array([1, slope_DG]), E, E + np.array([1, slope_FE]))

if P is None:
    print("Error: The perpendicular bisectors are parallel or do not intersect within the segment.")
else:
    # 绘制图形
    plt.figure()
    plt.plot([A[0], B[0]], [A[1], B[1]], 'b-', label='AB')
    plt.plot([B[0], C[0]], [B[1], C[1]], 'b-', label='BC')
    plt.plot([A[0], C[0]], [A[1], C[1]], 'b-', label='AC')
    plt.plot([D[0], P[0]], [D[1], P[1]], 'r--', label='DG')
    plt.plot([E[0], P[0]], [E[1], P[1]], 'g--', label='FE')
    plt.scatter([A[0], B[0], C[0], D[0], E[0], P[0]], [A[1], B[1], C[1], D[1], E[1], P[1]], color='black')
    plt.text(A[0], A[1], 'A', fontsize=12)
    plt.text(B[0], B[1], 'B', fontsize=12)
    plt.text(C[0], C[1], 'C', fontsize=12)
    plt.text(D[0], D[1], 'D', fontsize=12)
    plt.text(E[0], E[1], 'E', fontsize=12)
    plt.text(P[0], P[1], 'P', fontsize=12)

    # 计算角EPG的度数
    vec_PE = E - P
    vec_PG = C - P
    cos_theta = np.dot(vec_PE, vec_PG) / (np.linalg.norm(vec_PE) * np.linalg.norm(vec_PG))
    angle_EPG = np.degrees(np.arccos(cos_theta))

    print(f"Angle EPG: {angle_EPG:.2f} degrees")

    plt.legend()
    plt.axis('equal')
    plt.grid(True)
    plt.show()